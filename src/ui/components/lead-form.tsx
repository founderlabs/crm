import { Button, Modal } from "@mantine/core";
import React from "react";

interface ILeadForm {
  opened: boolean;
  close: () => void;
  isLoading: boolean;
  handleFormSubmit: () => void;
  isFormValidated: boolean;
  formFields: React.JSX.Element[];
  phoneErrorMessage?: string | null;
}

const LeadFormModal = ({
  close,
  opened,
  isLoading,
  formFields,
  isFormValidated,
  handleFormSubmit,
  phoneErrorMessage,
}: ILeadForm) => {
  return (
    <Modal
      title="Lead Details"
      opened={opened}
      onClose={close}
      centered
      // styles={{
      //   content: {
      //     height: "600px",
      //   },
      // }}
    >
      <form className="flex h-[500px] flex-col justify-between gap-4 overflow-x-scroll">
        <div className="flex flex-col gap-3">{formFields}</div>
        <Button
          disabled={isFormValidated || isLoading || phoneErrorMessage !== null}
          className="shrink-0 border bg-gray-600 text-stone-200 hover:bg-stone-200 hover:text-gray-600 md:border-gray-600"
          onClick={handleFormSubmit}
        >
          Submit
        </Button>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
