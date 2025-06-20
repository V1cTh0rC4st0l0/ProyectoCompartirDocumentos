// /components/PanelDeOpciones.tsx
import styles from '@/styles/panelDeOpciones.module.css';

interface PanelDeOpcionesProps {
    onClose: () => void;
}

const PanelDeOpciones: React.FC<PanelDeOpcionesProps> = ({ onClose }) => {
    return (
        <div className={styles.panelContainer} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.panelTitle}>Opciones Extra</h2>
            <p>Aquí puedes colocar el contenido de tu panel.</p>
            <ul>
                <li>Opción 1</li>
                <li>Opción 2</li>
                <li>Opción 3</li>
            </ul>
            <button onClick={onClose} className={styles.closeButton}>
                Cerrar
            </button>
        </div>
    );
};

export default PanelDeOpciones;