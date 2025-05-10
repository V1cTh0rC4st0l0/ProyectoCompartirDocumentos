import CreateUserForm from './components/CreateUserForm'
import UserList from './components/UserList'

export default function AdminPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-2xl font-bold">Panel de Administrador</h1>
            <CreateUserForm />
            <UserList />
        </div>
    )
}
