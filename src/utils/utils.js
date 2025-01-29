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

const commonEventAttributes = () => {
  let userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = userAgent.match(/(?:firefox|edge|chrome|safari|opera|rv)[\s/:](\d+(\.\d+)?)/i)?.[1] || "Unknown";
  if (userAgent.includes("Firefox")) {
    browserName = "Mozilla Firefox";
  } else if (userAgent.includes("Edg")) {
    browserName = "Microsoft Edge";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browserName = "Google Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserName = "Apple Safari";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browserName = "Opera";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    browserName = "Internet Explorer";
  }

  return {
    browserName,
    browserVersion,
    userAgent: navigator.userAgent,
    platform: navigator.userAgentData?.platform || navigator.platform || 'unknown',
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    isOnline: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      availableWidth: screen.availWidth,
      availableHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    }
  };
};

export { getDocNameColor, formatDDMMYYHHMMSS, commonEventAttributes }