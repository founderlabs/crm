import { Button, Modal } from "@mantine/core";
import React from "react";

interface ILeadForm {
  opened: boolean;
  close: () => void;
  handleFormSubmit: () => void;
  isFormValidated: boolean;
  formFields: React.JSX.Element[];
}

const LeadFormModal = ({
  close,
  opened,
  formFields,
  isFormValidated,
  handleFormSubmit,
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
          disabled={isFormValidated}
          className="bg-black text-white"
          onClick={handleFormSubmit}
        >
          Submit
        </Button>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
