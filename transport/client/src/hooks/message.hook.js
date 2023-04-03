import { useCallback } from 'react'
import M from 'materialize-css'

export const useMessage = () => {
    return useCallback(text => {
        //console.log(M.toast, text)
        if (M && text) {
            M.toast({ html: text })
        }
    }, [])
}