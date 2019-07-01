import { useRef, useEffect } from 'react'

export default function useWaitBuffer<T> (isWaiting: boolean, val: T) {
    const bufRef = useRef(val)

    useEffect(() => {
        if (!isWaiting) bufRef.current = val
    }, [val])

    return isWaiting ? bufRef.current : val
}
