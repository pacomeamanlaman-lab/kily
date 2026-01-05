-- =============================================
-- TABLE: conversations
-- Description: Conversations privées entre deux utilisateurs
-- =============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (participant_1_id != participant_2_id),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les utilisateurs peuvent voir leurs propres conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs propres conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Politique RLS: Les utilisateurs peuvent créer des conversations
CREATE POLICY "Les utilisateurs peuvent créer des conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs conversations
CREATE POLICY "Les utilisateurs peuvent supprimer leurs conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- =============================================
-- TABLE: messages
-- Description: Messages dans les conversations
-- =============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read ON messages(read);

-- Activer Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politique RLS: Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Politique RLS: Les utilisateurs peuvent marquer leurs messages comme lus
CREATE POLICY "Les utilisateurs peuvent marquer les messages comme lus"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs messages
CREATE POLICY "Les utilisateurs peuvent supprimer leurs messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Trigger pour mettre à jour last_message et last_message_at dans conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Commentaires pour documentation
COMMENT ON TABLE conversations IS 'Conversations privées entre deux utilisateurs';
COMMENT ON TABLE messages IS 'Messages dans les conversations privées';
COMMENT ON COLUMN messages.read IS 'Indique si le message a été lu par le destinataire';
