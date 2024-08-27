export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "EASY_START":
      return "Easy Start";
    case "NEW_LEAD":
      return "New Lead";
    case "QUALIFIED_LEAD":
      return "Qualified Lead";
    case "OPENED":
      return "Opened";
    case "IN_PROGRESS":
      return "In Progress";
    case "EMAILED":
      return "Emailed";
    case "CALLED":
      return "Called";
    case "SMS":
      return "SMS";
    case "UNQUALIFIED":
      return "Unqualified";
    case "ATTEMPTED_TO_CONTACT":
      return "Attempted to Contact";
    case "CONNECTED":
      return "Connected";
    case "BAD_TIMING":
      return "Bad Timing";
    default:
      return status;
  }
};
