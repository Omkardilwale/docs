import apiClient from "@/app/utils/intrercept";


const fetchDocuments = async (searchQuery) => {
  try {
    const response = await apiClient.get(`/proposal/doclist?proposalNo=${searchQuery}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

const getDocUrl = async (docId,bucketId) => {
  try {
    const response = await apiClient.get(`/stream/downloadUrl?bucketId=${bucketId}&docId=${docId}`); //policy-document == bucketId
    return response.data;
  } catch (error) {
    console.error('Error fetching document URL:', error);
    throw error;
  }
};


const fetchDocumentsByCatagory = async (searchQuery, docCode) => {
  try {
    const response = await apiClient.get(`/proposal/doclist?proposalNo=${searchQuery}&docType=${docCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    throw error;
  }
};

const login = async(requestBody)=>{
  try{
    const response = await fetch('https://devintegrationapi.tataaia.com/api/agent/auth/signin/', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    return response;
  }catch(error){
    console.error('Error fetching documents by category:', error);
    throw error;
  }
}

const sendEvent = async (eventData) => {
  console.log(eventData)
  try {
    const response = await apiClient.post('/event', {
      events: [
        {
          name: eventData.name,
          source: "docviewer",
          type: "appevent.docviewer",
          attributes: {
            ...eventData.attributes,
            logTime: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }).replace(',', ''),
            isMobile: true,
            userAgent: navigator.userAgent
          },
          time: new Date().toISOString()
        }
      ],
    });
    // console.log(response.data)
  } catch (error) {
    console.error('Error sending event:', error);
    throw error;
  }
};

export { fetchDocuments, getDocUrl, fetchDocumentsByCatagory, login, sendEvent };