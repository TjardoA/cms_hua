import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import CmsShell from "./CmsShell";
import { useCmsData } from "./CmsDataContext";

export default function CmsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getItem, updateItem } = useCmsData();
  const { canEdit } = useAuth();
  const readOnly = !canEdit;

  const item = getItem(id);

  const defaults = useMemo(
    () =>
      item ?? {
        id,
        title: `Item ${id ?? ""}`.trim(),
        desc: "Voeg hier een beschrijving toe.",
        img: "",
        additionalInfo: [],
      },
    [item, id]
  );

  const [title, setTitle] = useState(defaults.title);
  const [desc, setDesc] = useState(defaults.desc);
  const [image, setImage] = useState(defaults.img);
  const [additionalInfos, setAdditionalInfos] = useState(
    defaults.additionalInfo || []
  );
  const [newInfo, setNewInfo] = useState({
    title: "",
    desc: "",
    url: "",
  });
  const previewImage = image || defaults.img;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (readOnly) {
      navigate("/cms");
      return;
    }
    updateItem(defaults.id, {
      title,
      desc,
      img: image,
      additionalInfo: additionalInfos,
    });
    alert("Wijzigingen opgeslagen!");
    navigate("/cms");
  };

  const addAdditionalInfo = () => {
    if (!newInfo.title && !newInfo.desc && !newInfo.url) return;
    setAdditionalInfos((prev) => [...prev, newInfo]);
    setNewInfo({ title: "", desc: "", url: "" });
  };

  const removeAdditionalInfo = (index) => {
    setAdditionalInfos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExistingInfo = (index, key, value) => {
    setAdditionalInfos((prev) =>
      prev.map((info, i) => (i === index ? { ...info, [key]: value } : info))
    );
  };

  return (
    <CmsShell>
      <section className="cms-panel">
        <button
          type="button"
          className="cms-back-button"
          onClick={() => navigate("/cms")}
        >
          <span aria-hidden="true">←</span> Terug naar overzicht
        </button>

        <div className="cms-panel__head">
          <div>
            <p className="cms-section-title">Item bewerken</p>
            <p className="cms-section-subtitle">
              {readOnly
                ? "Alleen super admins kunnen aanpassen. Je bekijkt dit item in leesmodus."
                : "Werk de inhoud bij en vergeet niet om uw wijzigingen op te slaan."}
            </p>
          </div>
        </div>
        <span className="cms-panel__divider" aria-hidden="true" />

        <form className="cms-edit-form" onSubmit={handleSubmit}>
          <label className="cms-field">
            <span className="cms-field__label">Titel</span>
            <input
              type="text"
              className="cms-input"
              value={title}
              disabled={readOnly}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="cms-field">
            <span className="cms-field__label">Beschrijving</span>
            <textarea
              className="cms-input cms-input--textarea"
              value={desc}
              disabled={readOnly}
              onChange={(event) => setDesc(event.target.value)}
            />
          </label>

          <label className="cms-field">
            <span className="cms-field__label">Afbeelding URL</span>
            <input
              type="url"
              className="cms-input"
              value={image}
              disabled={readOnly}
              onChange={(event) => setImage(event.target.value)}
            />
          </label>

          <div className="cms-preview">
            <span className="cms-field__label">Voorbeeld afbeelding</span>
            {previewImage ? (
              <div className="cms-preview__frame">
                <img src={previewImage} alt="Voorbeeld" loading="lazy" />
              </div>
            ) : (
              <p className="cms-preview__placeholder">
                Voeg een afbeelding toe om het voorbeeld te zien.
              </p>
            )}
          </div>

          <div className="cms-field">
            <span className="cms-field__label">Aanvullende info toevoegen</span>
            <div className="cms-additional">
              <input
                type="text"
                className="cms-input"
                placeholder="Titel"
                value={newInfo.title}
                disabled={readOnly}
                onChange={(e) =>
                  setNewInfo((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <textarea
                className="cms-input cms-input--textarea"
                placeholder="Beschrijving"
                value={newInfo.desc}
                disabled={readOnly}
                onChange={(e) =>
                  setNewInfo((prev) => ({ ...prev, desc: e.target.value }))
                }
              />

              <div className="cms-form-actions">
                <button
                  type="button"
                  className="cms-btn cms-btn--primary"
                  disabled={readOnly}
                  onClick={addAdditionalInfo}
                >
                  Aanvullende info opslaan
                </button>
              </div>
            </div>

            {additionalInfos.length > 0 ? (
              <div className="cms-additional-list">
                {additionalInfos.map((info, index) => (
                  <div key={index} className="cms-additional-item">
                    <div className="cms-field">
                      <span className="cms-field__label">Titel</span>
                      <input
                        type="text"
                        className="cms-input"
                        value={info.title}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateExistingInfo(index, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <span className="cms-field__label">Beschrijving</span>
                      <textarea
                        className="cms-input cms-input--textarea"
                        value={info.desc}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateExistingInfo(index, "desc", e.target.value)
                        }
                      />
                    </div>
                    <div className="cms-field"></div>
                    <div className="cms-form-actions">
                      <button
                        type="button"
                        className="cms-btn cms-btn--ghost"
                        disabled={readOnly}
                        onClick={() => removeAdditionalInfo(index)}
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="cms-form-actions">
            <button type="submit" className="cms-btn cms-btn--primary">
              {readOnly ? "Terug" : "Opslaan"}
            </button>
            <button
              type="button"
              className="cms-btn cms-btn--ghost"
              onClick={() => navigate("/cms")}
            >
              Annuleren
            </button>
          </div>
        </form>
      </section>
    </CmsShell>
  );
}
