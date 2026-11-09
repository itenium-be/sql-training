import { useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import { Avatar } from './Avatar';
import { avatarIndexOf, avatarRef, CHARACTERS } from './avatars';
import { saveAvatar } from './game';

type AvatarPickerProps = {
  current: number;
  onClose: () => void;
  onSaved: () => void;
};

export function AvatarPicker({ current, onClose, onSaved }: AvatarPickerProps) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSlug, setActiveSlug] = useState(avatarRef(current).slug);

  const character = CHARACTERS.find(c => c.slug === activeSlug) ?? CHARACTERS[0];

  const pick = async (index: number) => {
    setSaving(true);
    try {
      const message = await saveAvatar(index);
      if (message) {
        setError(message);
      } else {
        onSaved();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Pick your avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body className="df-picker-body">
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="df-picker">
          <nav className="df-picker-rail">
            {CHARACTERS.map(c => (
              <button
                key={c.slug}
                type="button"
                className={`df-picker-railitem${c.slug === activeSlug ? ' df-picker-railitem-on' : ''}`}
                onClick={() => setActiveSlug(c.slug)}
              >
                {c.title}
              </button>
            ))}
          </nav>

          <div className="df-picker-detail">
            <h3 className="df-picker-title">{character.title}</h3>
            <p className="df-picker-tagline">{character.tagline}</p>
            <div className="df-picker-variants">
              {Array.from({ length: character.variants }, (_, i) => i + 1).map(variant => {
                const index = avatarIndexOf(character.slug, variant);
                return (
                  <button
                    key={variant}
                    type="button"
                    className={`df-avatar-option${index === current ? ' df-avatar-selected' : ''}`}
                    onClick={() => pick(index)}
                    disabled={saving}
                    aria-label={`${character.title}, option ${variant}`}
                  >
                    <Avatar index={index} label={character.title} size={104} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
