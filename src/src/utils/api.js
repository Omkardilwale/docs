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

export { fetchDocuments, getDocUrl, fetchDocumentsByCatagory ,login};