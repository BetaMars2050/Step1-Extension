
import request from '~/utils/request'


export const getCurrentUserTwInfo = () => {
    return request({
        method: 'get',
        url: '/twitter/getUserMe',
        requireToken: true
    })

}


export const searchUserByUsername = (params) => {
    return request({
        method: 'get',
        url: `/twitter/getUserName`,
        params,
        requireToken: true
    })

}

export const getWalletAddressByscreenName = (params) => {
    return request({
        method: 'get',
        url: `/twitter/getWalletAddress`,
        params,
        requireToken: true
    })
}