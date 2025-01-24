import { getDocNameColor } from "@/utils/utils"

const documentContentTypeStyle = (color)=>{
return({
    backgroundColor: getDocNameColor(color),
    width: "fit-content",
    padding: "5px",
    borderRadius: "5px",
    color: "white",
    opacity: 0.7,
    border: "1px solid",
    fontSize: "10px",
    marginLeft: "16px"
})
}

export {documentContentTypeStyle}