-- ============================================================================
-- STRENGTHEN DOCUMENT SECURITY
-- This migration adds additional security measures for the documents table
-- to prevent metadata manipulation and ensure data integrity
-- ============================================================================

-- Create a trigger to validate document metadata on insert/update
CREATE OR REPLACE FUNCTION public.validate_document_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notebook_id uuid;
    v_user_id uuid;
BEGIN
    -- Extract notebook_id from metadata
    v_notebook_id := (NEW.metadata->>'notebook_id')::uuid;
    
    -- Validate notebook_id is provided
    IF v_notebook_id IS NULL THEN
        RAISE EXCEPTION 'notebook_id is required in metadata';
    END IF;
    
    -- Get the owner of the notebook
    SELECT user_id INTO v_user_id
    FROM public.notebooks
    WHERE id = v_notebook_id;
    
    -- Validate notebook exists
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid notebook_id: notebook does not exist';
    END IF;
    
    -- For INSERT operations, verify the current user owns the notebook
    IF TG_OP = 'INSERT' THEN
        IF v_user_id != auth.uid() THEN
            RAISE EXCEPTION 'You can only create documents in your own notebooks';
        END IF;
    END IF;
    
    -- For UPDATE operations, verify the notebook_id hasn't changed
    IF TG_OP = 'UPDATE' THEN
        IF OLD.metadata->>'notebook_id' != NEW.metadata->>'notebook_id' THEN
            RAISE EXCEPTION 'Cannot change notebook_id of existing document';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger for documents table
DROP TRIGGER IF EXISTS validate_document_metadata_trigger ON public.documents;
CREATE TRIGGER validate_document_metadata_trigger
    BEFORE INSERT OR UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_document_metadata();

-- Add a check constraint to ensure metadata always contains notebook_id
ALTER TABLE public.documents
    DROP CONSTRAINT IF EXISTS documents_metadata_notebook_id_check;
    
ALTER TABLE public.documents
    ADD CONSTRAINT documents_metadata_notebook_id_check
    CHECK (metadata ? 'notebook_id' AND metadata->>'notebook_id' IS NOT NULL);

-- Create an index on metadata notebook_id for better performance
CREATE INDEX IF NOT EXISTS idx_documents_metadata_notebook_id 
    ON public.documents((metadata->>'notebook_id'));

-- Update the is_notebook_owner_for_document function to be more strict
CREATE OR REPLACE FUNCTION public.is_notebook_owner_for_document(doc_metadata jsonb)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.notebooks 
        WHERE id = (doc_metadata->>'notebook_id')::uuid 
        AND user_id = auth.uid()
        AND (doc_metadata->>'notebook_id') IS NOT NULL
    );
$$;

-- Add additional RLS policy for service role operations
DROP POLICY IF EXISTS "Service role can manage all documents" ON public.documents;
CREATE POLICY "Service role can manage all documents"
    ON public.documents FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (
        -- Even service role must provide valid notebook_id
        (metadata->>'notebook_id')::uuid IN (
            SELECT id FROM public.notebooks
        )
    );

-- Create a function to safely insert documents (for use by Edge Functions)
CREATE OR REPLACE FUNCTION public.insert_document_with_validation(
    p_content text,
    p_notebook_id uuid,
    p_embedding vector(1536),
    p_additional_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_document_id bigint;
    v_metadata jsonb;
BEGIN
    -- Verify notebook exists
    IF NOT EXISTS (SELECT 1 FROM public.notebooks WHERE id = p_notebook_id) THEN
        RAISE EXCEPTION 'Invalid notebook_id: notebook does not exist';
    END IF;
    
    -- Build metadata with notebook_id
    v_metadata := jsonb_build_object('notebook_id', p_notebook_id::text) || p_additional_metadata;
    
    -- Insert document
    INSERT INTO public.documents (content, metadata, embedding)
    VALUES (p_content, v_metadata, p_embedding)
    RETURNING id INTO v_document_id;
    
    RETURN v_document_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_document_with_validation TO authenticated;

-- Add comment explaining the security model
COMMENT ON TABLE public.documents IS 
'Stores vector embeddings for semantic search. 
Security: notebook_id in metadata is validated by trigger and cannot be changed after creation.
Always use insert_document_with_validation() function for safe inserts.';