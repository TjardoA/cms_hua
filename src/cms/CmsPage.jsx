import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useReadApi from "../../components/ReadApi";
import CmsShell from "./CmsShell";

export default function CmsPage() {
  const navigate = useNavigate();
  const { canEdit, authToken } = useAuth();
  const { posts, loading, error, refresh } = useReadApi(authToken);
  const [items, setItems] = useState([]);

  const onDragEnd = (result) => {
    if (!result.destination || !canEdit) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, moved);
      return next;
    });
  };

  useEffect(() => {
    setItems(posts || []);
  }, [posts]);

  const handleDelete = async () => {}; // verwijderknop verwijderd van hoofdpagina
  return (
    <CmsShell>
      <section className="cms-panel">
        <div className="cms-panel__head">
          <div>
            <p className="cms-section-title">Collectie beheren</p>
            <p className="cms-section-subtitle">
              Sleep items om de volgorde te wijzigen. Klik op Bewerken om de
              inhoud aan te passen.
            </p>
          </div>
          {canEdit ? (
            <button
              type="button"
              className="cms-btn cms-btn--primary"
              onClick={() => navigate("/cms/edit/new")}
            >
              + Nieuw item
            </button>
          ) : null}
        </div>
        <span className="cms-panel__divider" aria-hidden="true" />

        {loading ? (
          <p className="cms-preview__placeholder">Gegevens laden...</p>
        ) : null}
        {error ? (
          <p className="cms-preview__placeholder" role="alert">
            Fout bij laden: {error}
          </p>
        ) : null}

        {!loading && !items.length ? (
          <p className="cms-preview__placeholder">
            Geen items beschikbaar uit de API.
          </p>
        ) : null}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="cms-card-stack"
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={!canEdit}
                  >
                    {(dragProvided, snapshot) => (
                      <article
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`cms-card${
                          snapshot.isDragging ? " cms-card--dragging" : ""
                        }`}
                      >
                        <div className="cms-card__meta">
                          <span className="cms-card__index">{index + 1}</span>
                        </div>

                        <img
                          className="cms-card__media"
                          src={item.img}
                          alt={item.title}
                          loading="lazy"
                        />

                        <div className="cms-card__content">
                          <h2>{item.title}</h2>
                          <p>{item.desc}</p>
                        </div>

                        <button
                          type="button"
                          className={`cms-card__btn${
                            canEdit ? "" : " cms-card__btn--view"
                          }`}
                          onClick={() => navigate(`/cms/edit/${item.id}`)}
                        >
                          {canEdit ? "Bewerken" : "Inspecteren"}
                        </button>
                      </article>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </section>
    </CmsShell>
  );
}
