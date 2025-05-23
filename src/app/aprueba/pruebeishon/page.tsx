//import CreateUserForm from '../../admin/CreateUser/page.tsx'
import { FiX } from 'react-icons/fi'
import UserList from '../../admin/components/UserList'

export default function AdminPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <img src="@/public/images/Raxvel_log.png" alt="" />
            <h1 className="text-2xl font-bold">Panel de Administrador</h1>
            <UserList />
        </div>
    )
}
