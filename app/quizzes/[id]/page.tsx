"use client"
import { useParams } from 'next/navigation'

const page = () => {
    const { id } = useParams()
    console.log('id:', id)
    return (
        <div>
            this {id}
        </div>
    )
}

export default page

