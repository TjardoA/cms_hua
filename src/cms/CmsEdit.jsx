import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useReadApi from "../../components/ReadApi";
import {
  createPanoramaItem,
  deletePanoramaItem,
  updatePanoramaItem,
} from "./apiClient";
import CmsShell from "./CmsShell";

export default function CmsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit, authToken } = useAuth();
  const { posts, loading, error, refresh } = useReadApi(authToken);
  const readOnly = !canEdit;
  const isNew = id === "new";
  const [isDeleting, setIsDeleting] = useState(false);

  const item = useMemo(
    () => posts.find((entry) => String(entry.id) === id),
    [posts, id]
  );

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const fileInputRef = useRef(null);
  const normalizeInfo = (info = {}) => ({
    title: info.title ?? "",
    desc: info.desc ?? "",
    url: info.url ?? "",
    x: Number.isFinite(info.x) ? Math.min(Math.max(info.x, 0), 100) : 50,
    y: Number.isFinite(info.y) ? Math.min(Math.max(info.y, 0), 100) : 50,
  });

  const [additionalInfos, setAdditionalInfos] = useState(
    (item?.additionalInfo || []).map(normalizeInfo)
  );
  const [newInfo, setNewInfo] = useState(normalizeInfo());
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const previewImage = image || item?.img || "";

  // sync state when item data binnenkomt
  useEffect(() => {
    if (!item) return;
    setTitle(item.title ?? "");
    setDesc(item.desc ?? "");
    setImage(item.img ?? "");
    setAdditionalInfos((item.additionalInfo || []).map(normalizeInfo));
  }, [item]);

  const sliderMax = {
    width: imageSize.width || 100,
    height: imageSize.height || 100,
  };

  const toSliderValue = (percent, axis) => {
    const size = axis === "x" ? sliderMax.width : sliderMax.height;
    const safePercent = Number.isFinite(percent) ? percent : 50;
    return Math.round((safePercent / 100) * size);
  };

  const toPercentValue = (pixelValue, axis) => {
    const size = axis === "x" ? sliderMax.width : sliderMax.height;
    const raw = (Number(pixelValue) / (size || 100)) * 100;
    return Math.min(Math.max(raw, 0), 100);
  };

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    setImageSize({
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (readOnly) {
      navigate("/cms");
      return;
    }
    try {
      if (isNew) {
        await createPanoramaItem(
          {
            title,
            desc,
            img: image,
            additionalInfo: additionalInfos,
          },
          authToken
        );
        alert("Item aangemaakt!");
      } else {
        await updatePanoramaItem(
          id,
          {
            title,
            desc,
            img: image,
            additionalInfo: additionalInfos,
          },
          authToken
        );
        alert("Wijzigingen opgeslagen!");
      }
      refresh();
      navigate("/cms");
    } catch (err) {
      alert(err.message || "Opslaan mislukt");
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!window.confirm("Weet je zeker dat je dit item wilt verwijderen?"))
      return;
    try {
      setIsDeleting(true);
      await deletePanoramaItem(id, authToken);
      refresh();
      navigate("/cms");
    } catch (err) {
      alert(err.message || "Verwijderen mislukt");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Gebruik pad vanuit public/img zodat het statisch geserveerd wordt
    setImage(`/img/${file.name}`);
  };

  const addAdditionalInfo = () => {
    if (!newInfo.title && !newInfo.desc && !newInfo.url) return;
    setAdditionalInfos((prev) => [...prev, normalizeInfo(newInfo)]);
    setNewInfo(normalizeInfo());
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
        {loading ? (
          <p className="cms-preview__placeholder">Gegevens laden...</p>
        ) : null}
        {error ? (
          <p className="cms-preview__placeholder" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !isNew && !item ? (
          <p className="cms-preview__placeholder">
            Dit item kon niet worden gevonden.
          </p>
        ) : null}

        <form className="cms-edit-form" onSubmit={handleSubmit}>
          <label className="cms-field">
            <span className="cms-field__label">Titel</span>
            <input
              type="text"
              className="cms-input"
              value={title}
              disabled={readOnly || loading}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="cms-field">
            <span className="cms-field__label">Beschrijving</span>
            <textarea
              className="cms-input cms-input--textarea"
              value={desc}
              disabled={readOnly || loading}
              onChange={(event) => setDesc(event.target.value)}
            />
          </label>

          <label className="cms-field">
            <span className="cms-field__label">Afbeelding URL</span>
            <input
              type="url"
              className="cms-input"
              value={image}
              readOnly
            />
            <div className="cms-form-actions">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                disabled={readOnly || loading}
              />
              <button
                type="button"
                className="cms-btn cms-btn--ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={readOnly || loading}
              >
                Kies afbeelding
              </button>
              {image ? (
                <span className="cms-slider-value">
                  Gebruikt: {image.replace(/^https?:\/\/[^/]+/, "")}
                </span>
              ) : null}
            </div>
          </label>

          <div className="cms-preview">
            <span className="cms-field__label">Voorbeeld afbeelding</span>
            {previewImage ? (
              <div className="cms-preview__frame">
                <div className="cms-preview__image-wrapper">
                  <img
                    src={previewImage}
                    alt="Voorbeeld"
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={() => setImageSize({ width: 0, height: 0 })}
                  />
                  <div className="cms-hotspot-layer" aria-hidden="true">
                    {additionalInfos.map((info, index) => (
                      <div
                        key={`dot-${index}`}
                        className="cms-hotspot"
                        style={{
                          left: `${Number.isFinite(info.x) ? info.x : 50}%`,
                          top: `${Number.isFinite(info.y) ? info.y : 50}%`,
                        }}
                        title={info.title || `Hotspot ${index + 1}`}
                      />
                    ))}
                    <div
                      className="cms-hotspot cms-hotspot--draft"
                      style={{
                        left: `${Number.isFinite(newInfo.x) ? newInfo.x : 50}%`,
                        top: `${Number.isFinite(newInfo.y) ? newInfo.y : 50}%`,
                      }}
                      title="Nieuwe hotspot"
                    />
                  </div>
                </div>
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
                disabled={readOnly || loading}
                onChange={(e) =>
                  setNewInfo((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <textarea
                className="cms-input cms-input--textarea"
                placeholder="Beschrijving"
                value={newInfo.desc}
                disabled={readOnly || loading}
                onChange={(e) =>
                  setNewInfo((prev) => ({ ...prev, desc: e.target.value }))
                }
              />
              <div className="cms-slider-group">
                <label className="cms-slider-field">
                  <div className="cms-slider-label">
                    <span>Horizontale positie</span>
                    <span className="cms-slider-value">
                      {toSliderValue(newInfo.x, "x")}px (
                      {Math.round(Number.isFinite(newInfo.x) ? newInfo.x : 50)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={sliderMax.width}
                    value={toSliderValue(newInfo.x, "x")}
                    disabled={readOnly || loading}
                    className="cms-input cms-input--range"
                    onChange={(e) =>
                      setNewInfo((prev) => ({
                        ...prev,
                        x: toPercentValue(e.target.value, "x"),
                      }))
                    }
                  />
                </label>

                <label className="cms-slider-field">
                  <div className="cms-slider-label">
                    <span>Verticale positie</span>
                    <span className="cms-slider-value">
                      {toSliderValue(newInfo.y, "y")}px (
                      {Math.round(Number.isFinite(newInfo.y) ? newInfo.y : 50)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={sliderMax.height}
                    value={toSliderValue(newInfo.y, "y")}
                    disabled={readOnly || loading}
                    className="cms-input cms-input--range"
                    onChange={(e) =>
                      setNewInfo((prev) => ({
                        ...prev,
                        y: toPercentValue(e.target.value, "y"),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="cms-form-actions">
                <button
                  type="button"
                  className="cms-btn cms-btn--primary"
                  disabled={readOnly || loading}
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
                        disabled={readOnly || loading}
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
                        disabled={readOnly || loading}
                        onChange={(e) =>
                          updateExistingInfo(index, "desc", e.target.value)
                        }
                      />
                    </div>
                    <div className="cms-slider-group">
                      <label className="cms-slider-field">
                        <div className="cms-slider-label">
                          <span>Horizontale positie</span>
                          <span className="cms-slider-value">
                            {toSliderValue(info.x, "x")}px (
                            {Math.round(Number.isFinite(info.x) ? info.x : 50)}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={sliderMax.width}
                          value={toSliderValue(info.x, "x")}
                          disabled={readOnly || loading}
                          className="cms-input cms-input--range"
                          onChange={(e) =>
                            updateExistingInfo(
                              index,
                              "x",
                              toPercentValue(e.target.value, "x")
                            )
                          }
                        />
                      </label>

                      <label className="cms-slider-field">
                        <div className="cms-slider-label">
                          <span>Verticale positie</span>
                          <span className="cms-slider-value">
                            {toSliderValue(info.y, "y")}px (
                            {Math.round(Number.isFinite(info.y) ? info.y : 50)}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={sliderMax.height}
                          value={toSliderValue(info.y, "y")}
                          disabled={readOnly || loading}
                          className="cms-input cms-input--range"
                          onChange={(e) =>
                            updateExistingInfo(
                              index,
                              "y",
                              toPercentValue(e.target.value, "y")
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="cms-form-actions">
                      <button
                        type="button"
                        className="cms-btn cms-btn--ghost"
                        disabled={readOnly || loading}
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
            <button
              type="submit"
              className="cms-btn cms-btn--primary"
              disabled={loading || readOnly}
            >
              {readOnly ? "Terug" : "Opslaan"}
            </button>
            {!isNew && canEdit ? (
              <button
                type="button"
                className="cms-btn cms-btn--ghost"
                onClick={handleDelete}
                disabled={loading}
              >
                Verwijderen
              </button>
            ) : null}
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
