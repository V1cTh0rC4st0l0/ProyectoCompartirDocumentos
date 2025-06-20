// src/app/admin/components/ActivityLogCard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/dashboardadmin.module.css';
import { useCallback } from 'react';

interface IActivityLog {
    _id: string;
    username: string;
    action: 'upload' | 'share' | 'delete_file' | 'delete_group' | 'update_user' | 'login' | 'logout';
    targetType: 'file' | 'fileGroup' | 'user';
    details: {
        fileName?: string;
        groupName?: string;
        sharedWithUsernames?: string;
        oldValue?: unknown;
        newValue?: unknown;
        isNewGroup?: boolean;
        addedToExistingGroup?: boolean;
    };
    timestamp: string;
}

const LOGS_PER_LOAD = 10;

export default function ActivityLogCard() {
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async (currentLogsCount: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/activity-log?limit=${LOGS_PER_LOAD}&skip=${currentLogsCount}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();

            setLogs(prevLogs => {
                const newLogs = data.activityLogs as IActivityLog[];
                const existingLogIds = new Set(prevLogs.map(log => log._id));

                const filteredNewLogs = newLogs.filter(log => !existingLogIds.has(log._id));

                return [...prevLogs, ...filteredNewLogs];
            });

            setHasMore(data.activityLogs.length === LOGS_PER_LOAD);
        } catch (err: unknown) {
            console.error('Error fetching activity logs:', err);
            setError('Error al cargar el historial de actividad.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLogs([]);
        setHasMore(true);
        fetchLogs(0);
    }, []);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container && !loading && hasMore) {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                fetchLogs(logs.length);
            }
        }
    }, [loading, hasMore, logs.length]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const formatLogMessage = (log: IActivityLog) => {
        const date = new Date(log.timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        let message = `${date} - <strong>${log.username}</strong> `;

        switch (log.action) {
            case 'upload':
                message += `subió al grupo <strong>"${log.details.groupName}"</strong>`;
                if (log.details.fileName) {
                    message += ` los archivos: ${log.details.fileName}`;
                }
                if (log.details.sharedWithUsernames) {
                    message += `, compartido con <strong>${log.details.sharedWithUsernames}</strong>.`;
                } else {
                    message += `.`;
                }
                break;
            case 'share':
                message += `compartió el grupo <strong>"${log.details.groupName}"</strong>`;
                if (log.details.sharedWithUsernames) {
                    message += ` con <strong>${log.details.sharedWithUsernames}</strong>.`;
                } if (log.details.sharedWithUsernames) {
                    message += `, compartido con <strong>${log.details.sharedWithUsernames}</strong>.`;
                } else {
                    message += `.`;
                }
                break;
            case 'delete_file':
                message += `eliminó el archivo "${log.details.fileName}".`;
                break;
            case 'delete_group':
                message += `eliminó el grupo <strong>"${log.details.groupName}"</strong>.`;
                break;
            case 'update_user':
                message += `actualizó el usuario <strong>"${log.username}"</strong>`;
                if (log.details.oldValue !== undefined && log.details.newValue !== undefined) {
                    message += ` de ${JSON.stringify(log.details.oldValue)} a ${JSON.stringify(log.details.newValue)}.`;
                } else {
                    message += `.`;
                }
                break;
            case 'login':
                message += `inició sesión.`;
                break;
            case 'logout':
                message += `cerró sesión.`;
                break;
            default:
                message += `realizó una acción desconocida (<strong>${log.action}</strong>).`;
        }
        return message;
    };


    return (
        <div>
            <h3 className={styles.metricTitle}>Historial de Movimientos</h3>
            <div className={styles.metricContent} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {loading && logs.length === 0 ? (
                    <p>Cargando historial...</p>
                ) : error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : logs.length === 0 ? (
                    <p>No hay movimientos registrados.</p>
                ) : (
                    <div ref={scrollContainerRef} style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
                        <ul className={styles.activityLogList}>
                            {logs.map((log) => (
                                <li key={log._id} className={styles.activityLogItem}>
                                    <p dangerouslySetInnerHTML={{ __html: formatLogMessage(log) }} />
                                </li>
                            ))}
                        </ul>
                        {loading && hasMore && (
                            <div className={styles.loadingMore}>
                                Cargando más movimientos...
                            </div>
                        )}
                        {!hasMore && logs.length > 0 && (
                            <div className={styles.noMoreLogs}>
                                Fin del historial.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}