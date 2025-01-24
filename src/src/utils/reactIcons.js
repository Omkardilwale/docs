import { FaFileImage, FaFilePdf, FaFile, FaImages, FaFileVideo, FaFileAudio, FaFileCode, FaFileAlt, FaFileArchive } from 'react-icons/fa';  // Import required icons
import { BsFiletypeTiff } from "react-icons/bs";
 

const getDocumentIcon = (doc) => {
  const contentType = doc?.metaData?.contentType?.toLowerCase(); // Access the contentType and normalize case
  // console.log(doc)
 
  if (!contentType) {
    return <FaFile style={{ fontSize: '14px', color: '#9E9E9E', marginRight: '5px' }} />;
  }
 
  if (contentType.startsWith('image/')) {
    if (contentType === 'image/gif') {
      return <FaImages style={{ fontSize: '14px', color: '#FF9800', marginRight: '5px' }} />;
    }
    if (contentType==='image/tiff'){
      return <BsFiletypeTiff style={{ fontSize: '14px', color: 'white', marginRight: '5px', backgroundColor:'#149eca',padding:'1px',borderRadius:'3px' }}/>
    } 
    return <FaFileImage style={{ fontSize: '14px', color: '#4CAF50', marginRight: '5px' }} />;
  } else if (contentType === 'application/pdf') {
    return <FaFilePdf style={{ fontSize: '14px', color: '#f44336', marginRight: '5px' }} />;
  } else if (contentType.startsWith('video/')) {
    return <FaFileVideo style={{ fontSize: '14px', color: '#673AB7', marginRight: '5px' }} />;
  } else if (contentType.startsWith('audio/')) {
    return <FaFileAudio style={{ fontSize: '14px', color: '#FF5722', marginRight: '5px' }} />;
  } else if (['application/javascript', 'text/html', 'application/json', 'text/css'].includes(contentType)) {
    return <FaFileCode style={{ fontSize: '14px', color: '#2196F3', marginRight: '5px' }} />;
  } else if (['text/plain', 'text/csv'].includes(contentType)) {
    return <FaFileAlt style={{ fontSize: '14px', color: '#8BC34A', marginRight: '5px' }} />;
  } else if (contentType === 'application/zip') {
    return <FaFileArchive style={{ fontSize: '14px', color: '#FFEB3B', marginRight: '5px' }} />;
  } 
  else {
    return <FaFile style={{ fontSize: '14px', color: '#9E9E9E', marginRight: '5px' }} />;
  }
};
 
export { getDocumentIcon };