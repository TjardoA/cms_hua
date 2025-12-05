import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useReadApi from "../../components/ReadApi";
import { createPanoramaItem, deletePanoramaItem, updatePanoramaItem } from "./apiClient";
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
  const [catalogNumber, setCatalogNumber] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const fileInputRef = useRef(null);
  const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
  const normalizeXValue = (value) => {
    if (!Number.isFinite(value)) return 0.5;
    if (value > 1 || value < 0) {
      return clampValue(value / 100, 0, 1);
    }
    return clampValue(value, 0, 1);
  };
  const normalizeYValue = (value) => {
    if (!Number.isFinite(value)) return 0;
    if (value > 0.5 || value < -0.5) {
      return clampValue(0.5 - value / 100, -0.5, 0.5);
    }
    return clampValue(value, -0.5, 0.5);
  };
  const toLeftPercent = (value) => normalizeXValue(value) * 100;
  const toTopPercent = (value) => (0.5 - normalizeYValue(value)) * 100;
  const formatCoord = (value, axis) =>
    (axis === "x" ? normalizeXValue(value) : normalizeYValue(value)).toFixed(2);
  const normalizeInfo = (info = {}) => ({
    title: info.title ?? "",
    description: info.description ?? info.desc ?? "",
    catalog_number: info.catalog_number ?? "",
    page_number: info.page_number ?? "",
    url: info.url ?? "",
    img:
      info.img ??
      info.image ??
      info.image_url ??
      info.imageUrl ??
      info.photo ??
      info.photo_url ??
      info.photoUrl ??
      "",
    x: normalizeXValue(
      info.x ??
        info.x_percent ??
        info.xPercent ??
        info.xcoord ??
        info.x_coord ??
        info.x_pos ??
        info.xpos ??
        info.coordinate_x ??
        info.cordinate_x
    ),
    y: normalizeYValue(
      info.y ??
        info.y_percent ??
        info.yPercent ??
        info.ycoord ??
        info.y_coord ??
        info.y_pos ??
        info.ypos ??
        info.coordinate_y ??
        info.cordinate_y
    ),
  });

  const [additionalInfos, setAdditionalInfos] = useState(
    (item?.additionalInfo || []).map(normalizeInfo)
  );
  const [newInfo, setNewInfo] = useState(normalizeInfo());
  const [showNewInfoForm, setShowNewInfoForm] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const previewImage = image || item?.img || "";

  // sync state when item data binnenkomt
  useEffect(() => {
    if (!item) return;
    setTitle(item.title ?? "");
    setCatalogNumber(item.catalogNumber ?? "");
    setPageNumber(item.pageNumber ?? "");
    setDesc(item.desc ?? item.description ?? "");
    setImage(item.img ?? "");
    setAdditionalInfos((item.additionalInfo || []).map(normalizeInfo));
    setActiveHotspot(null);
  }, [item]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (readOnly) {
      navigate("/cms");
      return;
    }
    try {
      const primaryHotspot = additionalInfos[0] || {};
      const payload = {
        title,
        catalog_number: catalogNumber,
        page_number: pageNumber,
        description: desc,
        img: image,
        additionalInfo: additionalInfos,
        additional_info: additionalInfos,
        coordinate_x: primaryHotspot.x ?? null,
        cordinate_x: primaryHotspot.x ?? null,
        coordinate_y: primaryHotspot.y ?? null,
        cordinate_y: primaryHotspot.y ?? null,
      };
      if (isNew) {
        await createPanoramaItem(payload, authToken);
        alert("Item aangemaakt!");
      } else {
        await updatePanoramaItem(id, payload, authToken);
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
    if (!newInfo.title && !newInfo.description && !newInfo.url) return;
    setAdditionalInfos((prev) => [...prev, normalizeInfo(newInfo)]);
    setNewInfo(normalizeInfo());
    setShowNewInfoForm(false);
  };

  const removeAdditionalInfo = (index) => {
    setAdditionalInfos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExistingInfo = (index, key, value) => {
    setAdditionalInfos((prev) =>
      prev.map((info, i) => (i === index ? { ...info, [key]: value } : info))
    );
  };

  const handleNewInfoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNewInfo((prev) => ({ ...prev, img: `/img/${file.name}` }));
  };

  const handleExistingInfoFile = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateExistingInfo(index, "img", `/img/${file.name}`);
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
            <span className="cms-field__label">Catalog nummer</span>
            <input
              type="text"
              className="cms-input"
              value={catalogNumber}
              disabled={readOnly || loading}
              onChange={(event) => setCatalogNumber(event.target.value)}
            />
          </label>

          <label className="cms-field">
            <span className="cms-field__label">Pagina nummer</span>
            <input
              type="text"
              className="cms-input"
              value={pageNumber}
              disabled={readOnly || loading}
              onChange={(event) => setPageNumber(event.target.value)}
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
            <input type="url" className="cms-input" value={image} readOnly />
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

          <div className="cms-preview-row">
            <div className="cms-preview">
              <span className="cms-field__label">Voorbeeld afbeelding</span>
              {previewImage ? (
                <div className="cms-preview__frame">
                  <div className="cms-preview__image-wrapper">
                    <img
                      src={previewImage}
                      alt="Voorbeeld"
                      loading="lazy"
                    />
                    <div className="cms-hotspot-layer" aria-hidden="true">
                      {additionalInfos.map((info, index) => (
                        <div
                          key={`dot-${index}`}
                          className="cms-hotspot"
                          style={{
                            left: `${toLeftPercent(info.x)}%`,
                            top: `${toTopPercent(info.y)}%`,
                          }}
                          title={info.title || `Hotspot ${index + 1}`}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setActiveHotspot((prev) =>
                              prev === index ? null : index
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveHotspot((prev) =>
                                prev === index ? null : index
                              );
                            }
                          }}
                        />
                      ))}
                      {showNewInfoForm ? (
                        <div
                          className="cms-hotspot cms-hotspot--draft"
                          style={{
                            left: `${toLeftPercent(newInfo.x)}%`,
                            top: `${toTopPercent(newInfo.y)}%`,
                          }}
                          title="Nieuwe hotspot"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="cms-preview__placeholder">
                  Voeg een afbeelding toe om het voorbeeld te zien.
                </p>
              )}
              {previewImage && showNewInfoForm ? (
                <div className="cms-preview__controls">
                  <div className="cms-slider-group">
                    <label className="cms-slider-field">
                      <div className="cms-slider-label">
                        <span>Horizontale positie</span>
                        <span className="cms-slider-value">
                          {formatCoord(newInfo.x, "x")} (0 tot 1)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={normalizeXValue(newInfo.x)}
                        disabled={readOnly || loading}
                        className="cms-input cms-input--range"
                        onChange={(e) =>
                          setNewInfo((prev) => ({
                            ...prev,
                            x: normalizeXValue(parseFloat(e.target.value)),
                          }))
                        }
                      />
                    </label>

                    <label className="cms-slider-field">
                      <div className="cms-slider-label">
                        <span>Verticale positie</span>
                        <span className="cms-slider-value">
                          {formatCoord(newInfo.y, "y")} (0.5 boven tot -0.5 onder)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.5"
                        max="0.5"
                        step="0.01"
                        value={normalizeYValue(newInfo.y)}
                        disabled={readOnly || loading}
                        className="cms-input cms-input--range"
                        onChange={(e) =>
                          setNewInfo((prev) => ({
                            ...prev,
                            y: normalizeYValue(parseFloat(e.target.value)),
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              ) : null}
              {Number.isInteger(activeHotspot) &&
              additionalInfos[activeHotspot] ? (
                <div className="cms-hotspot-detail" role="dialog" aria-label="Hotspot details">
                  <div className="cms-hotspot-detail__header">
                    <p className="cms-hotspot-detail__title">
                      {additionalInfos[activeHotspot].title ||
                        `Hotspot ${activeHotspot + 1}`}
                    </p>
                    <button
                      type="button"
                      className="cms-btn cms-btn--ghost"
                      onClick={() => setActiveHotspot(null)}
                    >
                      Sluiten
                    </button>
                  </div>
                  {additionalInfos[activeHotspot].img ? (
                    <img
                      src={additionalInfos[activeHotspot].img}
                      alt={additionalInfos[activeHotspot].title || "Hotspot"}
                      className="cms-hotspot-detail__image"
                      loading="lazy"
                    />
                  ) : null}
                  {additionalInfos[activeHotspot].description ? (
                    <p className="cms-hotspot-detail__desc">
                      {additionalInfos[activeHotspot].description}
                    </p>
                  ) : null}
                  {additionalInfos[activeHotspot].url ? (
                    <a
                      href={additionalInfos[activeHotspot].url}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-hotspot-detail__link"
                    >
                      Meer info
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="cms-additional-panel">
              <div className="cms-additional-header">
                <span className="cms-field__label">Aanvullende info</span>
                {!showNewInfoForm ? (
                  <button
                    type="button"
                    className="cms-btn cms-btn--icon"
                    disabled={readOnly || loading}
                    aria-label="Nieuwe hotspot toevoegen"
                    onClick={() => {
                      setShowNewInfoForm(true);
                      setNewInfo(normalizeInfo());
                    }}
                  >
                    +
                  </button>
                ) : null}
              </div>

              {showNewInfoForm ? (
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
                    value={newInfo.description}
                    disabled={readOnly || loading}
                    onChange={(e) =>
                      setNewInfo((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <div className="cms-field">
                    <span className="cms-field__label">Afbeelding (optioneel)</span>
                    <input
                      type="text"
                      className="cms-input"
                      placeholder="/img/bestand.jpg"
                      value={newInfo.img}
                      disabled={readOnly || loading}
                      onChange={(e) =>
                        setNewInfo((prev) => ({ ...prev, img: e.target.value }))
                      }
                    />
                  <input
                    type="file"
                    accept="image/*"
                    disabled={readOnly || loading}
                    onChange={handleNewInfoFile}
                    className="cms-input cms-file-input"
                  />
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
                    <button
                      type="button"
                      className="cms-btn cms-btn--ghost"
                      disabled={readOnly || loading}
                      onClick={() => {
                        setShowNewInfoForm(false);
                        setNewInfo(normalizeInfo());
                      }}
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : null}

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
                        value={info.description}
                        disabled={readOnly || loading}
                        onChange={(e) =>
                          updateExistingInfo(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <span className="cms-field__label">Afbeelding (optioneel)</span>
                      <input
                        type="text"
                        className="cms-input"
                        value={info.img ?? ""}
                        disabled={readOnly || loading}
                        onChange={(e) =>
                          updateExistingInfo(index, "img", e.target.value)
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        disabled={readOnly || loading}
                        className="cms-input cms-file-input"
                        onChange={(e) => handleExistingInfoFile(index, e)}
                      />
                    </div>
                    <div className="cms-slider-group">
                      <label className="cms-slider-field">
                        <div className="cms-slider-label">
                          <span>Horizontale positie</span>
                          <span className="cms-slider-value">
                            {formatCoord(info.x, "x")} (0 tot 1)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={normalizeXValue(info.x)}
                          disabled={readOnly || loading}
                          className="cms-input cms-input--range"
                          onChange={(e) =>
                            updateExistingInfo(
                              index,
                              "x",
                              normalizeXValue(parseFloat(e.target.value))
                            )
                          }
                        />
                      </label>

                      <label className="cms-slider-field">
                        <div className="cms-slider-label">
                          <span>Verticale positie</span>
                          <span className="cms-slider-value">
                            {formatCoord(info.y, "y")} (0.5 boven tot -0.5 onder)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-0.5"
                          max="0.5"
                          step="0.01"
                          value={normalizeYValue(info.y)}
                          disabled={readOnly || loading}
                          className="cms-input cms-input--range"
                          onChange={(e) =>
                            updateExistingInfo(
                              index,
                              "y",
                              normalizeYValue(parseFloat(e.target.value))
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
