import { useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import { Avatar } from './Avatar';
import { AVATAR_COUNT, saveAvatar } from './game';

type AvatarPickerProps = {
  name: string;
  current: number;
  onClose: () => void;
  onSaved: () => void;
};

export function AvatarPicker({name, current, onClose, onSaved}: AvatarPickerProps) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = async (index: number) => {
    setSaving(true);
    try {
      const message = await saveAvatar(name, index);
      if (message) {
        setError(message);
      } else {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Pick your avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="df-avatar-grid">
          {Array.from({length: AVATAR_COUNT}, (_, i) => i + 1).map(index => (
            <button
              key={index}
              type="button"
              className={`df-avatar-option${index === current ? ' df-avatar-selected' : ''}`}
              onClick={() => pick(index)}
              disabled={saving}
              aria-label={`Avatar ${index}`}
            >
              <Avatar index={index} label={String(index)} size={80} />
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
