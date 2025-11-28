import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import CmsShell from "./CmsShell";
import { useCmsData } from "./CmsDataContext";

export default function CmsPage() {
  const navigate = useNavigate();
  const { items, reorderItems } = useCmsData();
  const { canEdit } = useAuth();

  const onDragEnd = (result) => {
    if (!result.destination || !canEdit) return;
    reorderItems(result.source.index, result.destination.index);
  };

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
        </div>
        <span className="cms-panel__divider" aria-hidden="true" />

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
