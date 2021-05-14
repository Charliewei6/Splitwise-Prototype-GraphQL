import axios from 'axios';
axios.defaults.withCredentials = false;
const domain = 'http://localhost:3001' 
const login = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const signUP = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getProfile = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const changeUserInfo = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const searchUser = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const createGroup = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getInvite = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const agreeRequest = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getGroupList = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const quitGroup = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const addExpense =(data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const addComment =(data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const deleteComment =(data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getDashboard = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getRecent =(data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const getGroupContent = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}
const settleUp = (data) => {
    return axios.post(`${domain}/graphql`,data).then(res => res.data)
}

const uploadImg = (file) => {
    return axios.post(`${domain}/upload`,file,{
        onUploadProgress : e => {
             console.log('upload progress =>',e.loaded/e.total*100)
        }
    }).then(res => res.data)
}
const getGroupDetail = (groupId) => {
    return axios.get(`${domain}/group?group_id=${groupId}`).then(res => res.data)
}

export {
     login,
     signUP,
     getDashboard,
     settleUp,
     getProfile,
     uploadImg,
     changeUserInfo,
     searchUser,
     createGroup,
     getInvite,
     getGroupList,
     getGroupDetail,
     getRecent,
     getGroupContent,
     addExpense,
     quitGroup,
     agreeRequest,
     addComment,
     deleteComment
}