import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { authState } from '../state/auth';
import {
  DEFAULT_ESTADO_COLOR,
  ESTADO_COLORS,
  formatCOP,
  formatFecha,
} from '../utils/pedidos';

const REPORTE_INVENTARIO_URL =
  'https://siape-production.up.railway.app/api/reportes/inventario';

const REPORTE_PROVEEDORES_URL =
  'https://siape-production.up.railway.app/api/reportes/proveedores';

const REPORTE_TRABAJADORES_URL =
  'https://siape-production.up.railway.app/api/reportes/trabajadores';

const REPORTE_VENTAS_URL =
  'https://siape-production.up.railway.app/api/reportes/ventas';

const REPORTE_COSTOS_URL =
  'https://siape-production.up.railway.app/api/reportes/costos';

const AGRUPACIONES = ['semana', 'dia'] as const;

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

type ProductoCritico = {
  nombre_producto: string;
  descripcion_bodega: string;
  cantidad_disponible: number;
  cantidad_minima: number;
  [key: string]: unknown;
};

type ProveedorReporte = {
  nombre_proveedor: string;
  NIT: string;
  total_productos: number;
  total_pedidos: number;
  [key: string]: unknown;
};

type TrabajadorReporte = {
  nombre: string;
  cargo: string;
  turno: string;
  celular: string;
  correo: string;
  [key: string]: unknown;
};

type VentaPeriodo = {
  inicio_semana?: string;
  semana?: string;
  ingresos: number;
  [key: string]: unknown;
};

type VentaResumen = {
  total_facturas: number;
  ingresos_totales: number;
  promedio_por_factura: number;
  [key: string]: unknown;
};

type VentaReporte = {
  resumen: VentaResumen;
  por_semana: VentaPeriodo[];
  [key: string]: unknown;
};

type CostoPedido = {
  fecha_creacion: string;
  nombre_proveedor: string;
  estado: string;
  valor_total: number;
  [key: string]: unknown;
};

type CostoResumen = {
  total_pedidos: number;
  costo_total: number;
  promedio_por_pedido: number;
  [key: string]: unknown;
};

type CostoReporte = {
  resumen: CostoResumen;
  pedidos: CostoPedido[];
  [key: string]: unknown;
};

function ReportesScreen() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [showFechaInicioPicker, setShowFechaInicioPicker] = useState(false);

  const [fechaFin, setFechaFin] = useState('');
  const [showFechaFinPicker, setShowFechaFinPicker] = useState(false);

  const [agrupacion, setAgrupacion] = useState<string>('semana');
  const [agrupacionModalVisible, setAgrupacionModalVisible] = useState(false);

  const [ventasReporte, setVentasReporte] = useState<VentaReporte | null>(
    null,
  );
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState('');

  const handleFechaInicioChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFechaInicioPicker(false);

    if (selectedDate) {
      setFechaInicio(formatDateISO(selectedDate));
    }
  };

  const handleFechaFinChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFechaFinPicker(false);

    if (selectedDate) {
      setFechaFin(formatDateISO(selectedDate));
    }
  };

  const handleSelectAgrupacion = (nuevaAgrupacion: string) => {
    setAgrupacion(nuevaAgrupacion);
    setAgrupacionModalVisible(false);
  };

  const handleGenerarReporteVentas = async () => {
    setErrorVentas('');

    if (!fechaInicio || !fechaFin) {
      setErrorVentas('Selecciona la fecha de inicio y la fecha de fin.');
      return;
    }

    setLoadingVentas(true);

    try {
      const response = await axios.get(REPORTE_VENTAS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          agrupacion,
        },
      });

      setVentasReporte(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorVentas(err.response.data.message);
      } else {
        setErrorVentas('Ocurrió un error al generar el reporte de ventas.');
      }
    } finally {
      setLoadingVentas(false);
    }
  };

  const [totalCriticos, setTotalCriticos] = useState(0);
  const [productosCriticos, setProductosCriticos] = useState<
    ProductoCritico[]
  >([]);
  const [loadingCriticos, setLoadingCriticos] = useState(true);
  const [errorCriticos, setErrorCriticos] = useState('');

  const [proveedoresReporte, setProveedoresReporte] = useState<
    ProveedorReporte[] | null
  >(null);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [errorProveedores, setErrorProveedores] = useState('');

  const handleGenerarReporteProveedores = async () => {
    setErrorProveedores('');
    setLoadingProveedores(true);

    try {
      const response = await axios.get(REPORTE_PROVEEDORES_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setProveedoresReporte(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorProveedores(err.response.data.message);
      } else {
        setErrorProveedores(
          'Ocurrió un error al generar el reporte de proveedores.',
        );
      }
    } finally {
      setLoadingProveedores(false);
    }
  };

  const [trabajadoresReporte, setTrabajadoresReporte] = useState<
    TrabajadorReporte[] | null
  >(null);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const [errorTrabajadores, setErrorTrabajadores] = useState('');

  const handleGenerarReporteTrabajadores = async () => {
    setErrorTrabajadores('');
    setLoadingTrabajadores(true);

    try {
      const response = await axios.get(REPORTE_TRABAJADORES_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setTrabajadoresReporte(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorTrabajadores(err.response.data.message);
      } else {
        setErrorTrabajadores(
          'Ocurrió un error al generar el reporte de trabajadores.',
        );
      }
    } finally {
      setLoadingTrabajadores(false);
    }
  };

  const [costosFechaInicio, setCostosFechaInicio] = useState('');
  const [showCostosFechaInicioPicker, setShowCostosFechaInicioPicker] =
    useState(false);

  const [costosFechaFin, setCostosFechaFin] = useState('');
  const [showCostosFechaFinPicker, setShowCostosFechaFinPicker] =
    useState(false);

  const [costosReporte, setCostosReporte] = useState<CostoReporte | null>(
    null,
  );
  const [loadingCostos, setLoadingCostos] = useState(false);
  const [errorCostos, setErrorCostos] = useState('');

  const handleCostosFechaInicioChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowCostosFechaInicioPicker(false);

    if (selectedDate) {
      setCostosFechaInicio(formatDateISO(selectedDate));
    }
  };

  const handleCostosFechaFinChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowCostosFechaFinPicker(false);

    if (selectedDate) {
      setCostosFechaFin(formatDateISO(selectedDate));
    }
  };

  const handleGenerarReporteCostos = async () => {
    setErrorCostos('');

    if (!costosFechaInicio || !costosFechaFin) {
      setErrorCostos('Selecciona la fecha de inicio y la fecha de fin.');
      return;
    }

    setLoadingCostos(true);

    try {
      const response = await axios.get(REPORTE_COSTOS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
        params: {
          fecha_inicio: costosFechaInicio,
          fecha_fin: costosFechaFin,
        },
      });

      setCostosReporte(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorCostos(err.response.data.message);
      } else {
        setErrorCostos('Ocurrió un error al generar el reporte de costos.');
      }
    } finally {
      setLoadingCostos(false);
    }
  };

  useEffect(() => {
    const fetchReporteInventario = async () => {
      setErrorCriticos('');
      setLoadingCriticos(true);

      try {
        const response = await axios.get(REPORTE_INVENTARIO_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setTotalCriticos(response.data.total_criticos);
        setProductosCriticos(response.data.productos ?? []);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorCriticos(err.response.data.message);
        } else {
          setErrorCriticos(
            'Ocurrió un error al cargar el reporte de inventario.',
          );
        }
      } finally {
        setLoadingCriticos(false);
      }
    };

    fetchReporteInventario();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ventas</Text>

        <Text style={styles.fieldLabel}>Fecha de inicio</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowFechaInicioPicker(true)}
        >
          <Text
            style={
              fechaInicio ? styles.selectorText : styles.selectorPlaceholder
            }
          >
            {fechaInicio || 'Selecciona una fecha'}
          </Text>
        </TouchableOpacity>

        {showFechaInicioPicker ? (
          <DateTimePicker
            value={fechaInicio ? parseISODate(fechaInicio) : new Date()}
            mode="date"
            display="default"
            onChange={handleFechaInicioChange}
          />
        ) : null}

        <Text style={styles.fieldLabel}>Fecha de fin</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowFechaFinPicker(true)}
        >
          <Text
            style={
              fechaFin ? styles.selectorText : styles.selectorPlaceholder
            }
          >
            {fechaFin || 'Selecciona una fecha'}
          </Text>
        </TouchableOpacity>

        {showFechaFinPicker ? (
          <DateTimePicker
            value={fechaFin ? parseISODate(fechaFin) : new Date()}
            mode="date"
            display="default"
            onChange={handleFechaFinChange}
          />
        ) : null}

        <Text style={styles.fieldLabel}>Agrupación</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setAgrupacionModalVisible(true)}
        >
          <Text style={styles.selectorText}>{agrupacion}</Text>
        </TouchableOpacity>

        <Modal
          visible={agrupacionModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setAgrupacionModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona la agrupación</Text>
              <FlatList
                data={AGRUPACIONES}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectAgrupacion(item)}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAgrupacionModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerarReporteVentas}
          disabled={loadingVentas}
        >
          <Text style={styles.buttonText}>
            {loadingVentas ? 'Generando...' : 'Generar Reporte'}
          </Text>
        </TouchableOpacity>

        {errorVentas ? <Text style={styles.error}>{errorVentas}</Text> : null}

        {ventasReporte ? (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Facturas</Text>
                <Text style={styles.statValue}>
                  {ventasReporte.resumen.total_facturas}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Ingresos totales</Text>
                <Text style={styles.statValue}>
                  {formatCOP(Number(ventasReporte.resumen.ingresos_totales))}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Promedio/factura</Text>
                <Text style={styles.statValue}>
                  {formatCOP(
                    Number(ventasReporte.resumen.promedio_por_factura),
                  )}
                </Text>
              </View>
            </View>

            {ventasReporte.por_semana.length === 0 ? (
              <Text style={styles.proximamente}>
                No hay datos para el período seleccionado.
              </Text>
            ) : (
              ventasReporte.por_semana.map((periodo, index) => (
                <View
                  key={`${periodo.inicio_semana ?? periodo.semana}-${index}`}
                  style={styles.periodoRow}
                >
                  <Text style={styles.periodoFecha}>
                    {formatFecha(periodo.inicio_semana ?? periodo.semana ?? '')}
                  </Text>
                  <Text style={styles.periodoIngresos}>
                    {formatCOP(Number(periodo.ingresos))}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock Crítico</Text>

        {loadingCriticos ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : errorCriticos ? (
          <Text style={styles.error}>{errorCriticos}</Text>
        ) : (
          <>
            <Text style={styles.totalCriticos}>
              Total críticos: {totalCriticos}
            </Text>

            {productosCriticos.length === 0 ? (
              <Text style={styles.proximamente}>
                No hay productos en estado crítico.
              </Text>
            ) : (
              productosCriticos.map((producto, index) => (
                <View
                  key={`${producto.nombre_producto}-${index}`}
                  style={styles.criticoRow}
                >
                  <Text style={styles.criticoNombre}>
                    {producto.nombre_producto}
                  </Text>
                  <Text style={styles.criticoDetalle}>
                    {producto.descripcion_bodega}
                  </Text>
                  <Text style={styles.criticoDetalle}>
                    Disponible: {producto.cantidad_disponible} · Mínima:{' '}
                    {producto.cantidad_minima}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proveedores</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerarReporteProveedores}
          disabled={loadingProveedores}
        >
          <Text style={styles.buttonText}>
            {loadingProveedores ? 'Generando...' : 'Generar Reporte'}
          </Text>
        </TouchableOpacity>

        {errorProveedores ? (
          <Text style={styles.error}>{errorProveedores}</Text>
        ) : null}

        {proveedoresReporte ? (
          proveedoresReporte.length === 0 ? (
            <Text style={styles.proximamente}>
              No hay proveedores para mostrar.
            </Text>
          ) : (
            proveedoresReporte.map((proveedor, index) => (
              <View
                key={`${proveedor.nombre_proveedor}-${index}`}
                style={styles.proveedorRow}
              >
                <Text style={styles.proveedorNombre}>
                  {proveedor.nombre_proveedor}
                </Text>
                <Text style={styles.proveedorDetalle}>
                  NIT: {proveedor.NIT}
                </Text>
                <Text style={styles.proveedorDetalle}>
                  Productos: {proveedor.total_productos} · Pedidos:{' '}
                  {proveedor.total_pedidos}
                </Text>
              </View>
            ))
          )
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trabajadores</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerarReporteTrabajadores}
          disabled={loadingTrabajadores}
        >
          <Text style={styles.buttonText}>
            {loadingTrabajadores ? 'Generando...' : 'Generar Reporte'}
          </Text>
        </TouchableOpacity>

        {errorTrabajadores ? (
          <Text style={styles.error}>{errorTrabajadores}</Text>
        ) : null}

        {trabajadoresReporte ? (
          trabajadoresReporte.length === 0 ? (
            <Text style={styles.proximamente}>
              No hay trabajadores para mostrar.
            </Text>
          ) : (
            trabajadoresReporte.map((trabajador, index) => (
              <View
                key={`${trabajador.nombre}-${index}`}
                style={styles.trabajadorRow}
              >
                <Text style={styles.trabajadorNombre}>
                  {trabajador.nombre}
                </Text>
                <Text style={styles.trabajadorDetalle}>
                  {trabajador.cargo} · {trabajador.turno}
                </Text>
                <Text style={styles.trabajadorDetalle}>
                  {trabajador.celular}
                </Text>
                <Text style={styles.trabajadorDetalle}>
                  {trabajador.correo}
                </Text>
              </View>
            ))
          )
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Costos</Text>

        <Text style={styles.fieldLabel}>Fecha de inicio</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowCostosFechaInicioPicker(true)}
        >
          <Text
            style={
              costosFechaInicio
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {costosFechaInicio || 'Selecciona una fecha'}
          </Text>
        </TouchableOpacity>

        {showCostosFechaInicioPicker ? (
          <DateTimePicker
            value={
              costosFechaInicio ? parseISODate(costosFechaInicio) : new Date()
            }
            mode="date"
            display="default"
            onChange={handleCostosFechaInicioChange}
          />
        ) : null}

        <Text style={styles.fieldLabel}>Fecha de fin</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowCostosFechaFinPicker(true)}
        >
          <Text
            style={
              costosFechaFin ? styles.selectorText : styles.selectorPlaceholder
            }
          >
            {costosFechaFin || 'Selecciona una fecha'}
          </Text>
        </TouchableOpacity>

        {showCostosFechaFinPicker ? (
          <DateTimePicker
            value={costosFechaFin ? parseISODate(costosFechaFin) : new Date()}
            mode="date"
            display="default"
            onChange={handleCostosFechaFinChange}
          />
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerarReporteCostos}
          disabled={loadingCostos}
        >
          <Text style={styles.buttonText}>
            {loadingCostos ? 'Generando...' : 'Generar Reporte'}
          </Text>
        </TouchableOpacity>

        {errorCostos ? <Text style={styles.error}>{errorCostos}</Text> : null}

        {costosReporte ? (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Pedidos</Text>
                <Text style={styles.statValue}>
                  {costosReporte.resumen.total_pedidos}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Costo total</Text>
                <Text style={styles.statValue}>
                  {formatCOP(Number(costosReporte.resumen.costo_total))}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Promedio/pedido</Text>
                <Text style={styles.statValue}>
                  {formatCOP(
                    Number(costosReporte.resumen.promedio_por_pedido),
                  )}
                </Text>
              </View>
            </View>

            {costosReporte.pedidos.length === 0 ? (
              <Text style={styles.proximamente}>
                No hay pedidos para el período seleccionado.
              </Text>
            ) : (
              costosReporte.pedidos.map((pedido, index) => (
                <View
                  key={`${pedido.fecha_creacion}-${index}`}
                  style={styles.pedidoRow}
                >
                  <View style={styles.pedidoHeader}>
                    <Text style={styles.pedidoProveedor}>
                      {pedido.nombre_proveedor}
                    </Text>
                    <Text
                      style={[
                        styles.pedidoEstado,
                        {
                          color:
                            ESTADO_COLORS[pedido.estado] ??
                            DEFAULT_ESTADO_COLOR,
                        },
                      ]}
                    >
                      {pedido.estado}
                    </Text>
                  </View>
                  <Text style={styles.pedidoDetalle}>
                    {formatFecha(pedido.fecha_creacion)}
                  </Text>
                  <Text style={styles.pedidoValor}>
                    {formatCOP(Number(pedido.valor_total))}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  proximamente: {
    fontSize: 14,
    color: '#555',
  },
  totalCriticos: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  criticoRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginBottom: 8,
  },
  criticoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 2,
  },
  criticoDetalle: {
    fontSize: 13,
    color: '#D32F2F',
  },
  button: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  proveedorRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  proveedorNombre: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  proveedorDetalle: {
    fontSize: 13,
    color: '#555',
  },
  trabajadorRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  trabajadorNombre: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  trabajadorDetalle: {
    fontSize: 13,
    color: '#555',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 8,
  },
  selector: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  selectorText: {
    fontSize: 15,
    color: '#000',
  },
  selectorPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 10,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  periodoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  periodoFecha: {
    fontSize: 13,
    color: '#555',
  },
  periodoIngresos: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  pedidoRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pedidoProveedor: {
    fontSize: 14,
    fontWeight: '600',
  },
  pedidoEstado: {
    fontSize: 13,
    fontWeight: '600',
  },
  pedidoDetalle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  pedidoValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
  },
});

export default ReportesScreen;
