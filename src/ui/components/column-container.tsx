import { useMemo } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import type { ColumnContainer } from "../types";
import { CSS } from "@dnd-kit/utilities";

import TaskCard from "./task-card";
import { LeadDND } from "~/pages/dashboard/leads/[id]";

interface Props {
  column: ColumnContainer;
  tasks: LeadDND[];
  open: () => void;
  handleLeadClick: (id: string) => void;
}

function ColumnContainer({ column, tasks, open, handleLeadClick }: Props) {
  const tasksIds = useMemo(() => {
    return tasks?.map((task) => task?.id);
  }, [tasks]);

  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column?.value as string,
    data: {
      type: "Column-crm",
      column,
    },
    disabled: false,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-primary flex h-[500px] max-h-[500px] w-[350px] flex-col rounded-md border-2  border-pink-500 opacity-40 "
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className=" bg-primary flex h-[500px] max-h-[500px] w-[350px] flex-col rounded-md "
    >
      <div className="text-black-1 mb-4 flex h-[42px] w-[304px] items-center justify-between  rounded-md px-4 font-semibold">
        <p>{column.label}</p>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 overflow-y-auto overflow-x-hidden p-2">
        <SortableContext items={tasksIds}>
          {tasks?.map((task) => (
            <TaskCard
              task={task}
              key={task.id}
              handleLeadClick={handleLeadClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default ColumnContainer;
