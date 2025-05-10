import UserFileGroups from '../admin/components/UserFileGroups'

export default function UsuarioPage() {
    const usuarioId = 'REEMPLAZAR_CON_ID_AUTENTICADO'

    return (
        <div className="p-8">
            <UserFileGroups usuarioId={usuarioId} />
        </div>
    )
}