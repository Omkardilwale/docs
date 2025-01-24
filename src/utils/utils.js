import moment from "moment";

const getDocNameColor = (docName) => {
    switch (docName) {
      case "PAN Card":
        return "#00008bcf";
      case "NEFT Bank Statement Copy":
        return "#27ae60";
      case "Customer Confidential Report":
        return "#e67e22";
      case "SIS Attachment Form Proof Type":
        return "darkmagenta";
      case "Customer Information Sheet Proof Type 1":
        return "darkred";
      case "Aadhar card":
        return "#ff2323";
      default:
        return "#7f8c8d";
    }
  };

  const formatDDMMYYHHMMSS = (dateToFormat)=>{
    if(dateToFormat){
      const date = moment(dateToFormat).format("DD/MM/YY  HH:mm")
      return date
    }else{
      return moment().format("DD/MM/YY  HH:mm")
    }
  }




  export{getDocNameColor , formatDDMMYYHHMMSS}