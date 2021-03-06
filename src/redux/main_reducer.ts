import {mainAPI} from "../api/api";
import {stopSubmit, reset} from "redux-form";
import {PostDataType, ProfileType, PhotosType} from "./types";
import {TrimStateType} from "./store_redux";
import {Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";

const ADD_POST = 'TriM/main/ADD-POST'
const SET_USER_PROFILE = 'TriM/main/SET_USER_PROFILE'
const SET_USER_STATUS = 'TriM/main/SET_USER_STATUS'
const DELETE_POST = 'TriM/main/DELETE_POST'
const SAVE_PHOTO_SUCCESS = 'TriM/main/SAVE_PHOTO_SUCCESS'

//type PersonDataType = {}

let initialization = {
    //personData: {} ,
    postData: [   {
                id: 1,
                header: 'some text...',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo vitae delectus culpa est in eius quis illum ipsum quibusdam, possimus doloremque officia at ut, aspernatur voluptatum laborum blanditiis repellat rerum.',
                data: '22.22.22'
            },
            {id: 2, header: 'some text...', content: 'Your text.', data: '22/02/2020'},
            {id: 3, header: 'some text...', content: 'and it too', data: '22/02/2020'},
        ]as Array<PostDataType>,
    profile: null as ProfileType | null,
    status: ''
    //'Никогда не жалуйтесь на судьбу! Ей с вами, может быть, тоже не очень-то и приятно=)'
}
type InitializationType = typeof initialization

let mainReducer = (state = initialization, action: ActionsTypes): InitializationType => {
    switch (action.type) {
        case ADD_POST: {
            type NewPostDataType = {
                id: number
                header: string
                content: string
                data: any
            }
            let newPostData: NewPostDataType = {
                header: 'some text...',
                content: action.value,
                data: action.curData
            } as NewPostDataType
            return {
                ...state,
                postData: [newPostData, ...state.postData],
            };
        }
        case SET_USER_PROFILE: {
            return {
                ...state,
                profile: action.profile
            }
        }
        case SET_USER_STATUS: {
            return {
                ...state,
                status: action.status
            }
        }
        case DELETE_POST: {
            return {
                ...state,
                postData: state.postData.filter(p => p.id !== action.postId)
            }
        }
        case SAVE_PHOTO_SUCCESS: {
            return {
                ...state,
                profile: {...state.profile, photos: action.photos} as ProfileType
            }
        }

        default:
            return state;
    }
}


type ActionsTypes = AddPostActionType | SetUserProfileActionType | SetUserStatusActionType | DeletePostActionType | SavePhotoSuccessActionType

type AddPostActionType = {
    type: typeof ADD_POST
    value: string
    curData: string
}
export const addPost = (value: string, curData: string): AddPostActionType => ({type: ADD_POST, value, curData});

type SetUserProfileActionType = {
    type: typeof SET_USER_PROFILE
    profile: ProfileType
}
export const setUserProfile = (profile: ProfileType): SetUserProfileActionType => ({type: SET_USER_PROFILE, profile});

type SetUserStatusActionType = {
    type: typeof SET_USER_STATUS
    status: string
}
export const setUserStatus = (status: string): SetUserStatusActionType => ({type: SET_USER_STATUS, status});

type DeletePostActionType = {
    type: typeof DELETE_POST
    postId: number
}
export const deletePost = (postId: number): DeletePostActionType => ({type: DELETE_POST, postId});

type SavePhotoSuccessActionType = {
    type: typeof SAVE_PHOTO_SUCCESS
    photos: PhotosType
}
export const savePhotoSuccess = (photos: PhotosType): SavePhotoSuccessActionType => ({type: SAVE_PHOTO_SUCCESS, photos});

type GetStateType = () => TrimStateType
type DispatchType = Dispatch<ActionsTypes>
type ThunkActionType = ThunkAction<Promise<void>, TrimStateType, any, ActionsTypes>

export const setUser = (userId: number | null): ThunkActionType => async (dispatch) => {
    try {
        let response = await mainAPI.getUserProfile(userId)
        dispatch(setUserProfile(response));
    } catch(error) { //reject promise

    }
}
export const getUserStatus = (userId: number): ThunkActionType=> async (dispatch) => {
    let response = await mainAPI.getUserStatus(userId)
    dispatch(setUserStatus(response));
}

export const updateUserStatus = (status: string): ThunkActionType => async (dispatch) => {
    let response = await mainAPI.updateUserStatus(status)
    if (response.resultCode === 0)
        dispatch(setUserStatus(status));
}
export const savePhoto = (file: any): ThunkActionType => async (dispatch) => {
    let response = await mainAPI.savePhoto(file)
    if (response.resultCode === 0)
        dispatch(savePhotoSuccess(response.data));
}
export const saveNewData = (profile: ProfileType): ThunkActionType => async (dispatch, getState: GetStateType) => {
    const userId = getState().auth.id
    let response = await mainAPI.saveNewData(profile)
    if (response.resultCode === 0) {
        dispatch(setUser(userId));
    } else {
        let message = response.messages
        // @ts-ignore
        dispatch(stopSubmit('personInfo', {_error: message}))
        return Promise.reject(message[0])
    }
}

export const addPostTC = (value: string, curData: string) => (dispatch: DispatchType, getState: GetStateType) => {
    dispatch(addPost(value, curData));
    // @ts-ignore
    dispatch(reset('addPostForm'));
}

export default mainReducer;

