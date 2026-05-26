import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Package,
  Calendar,
  Hash,
  User,
  DollarSign,
  RefreshCw
} from "lucide-react";

const STATUS_LABELS = {
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  preparando: {
    label: "Preparando",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  enviado: {
    label: "Enviado",
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  en_camino: {
    label: "En camino",
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  entregado: {
    label: "Entregado",
    color: "bg-green-100 text-green-700 border-green-200"
  }
};

export default function OrderCard({ order }) {

  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const statusInfo =
    STATUS_LABELS[status] ||
    STATUS_LABELS.confirmado;

  const handleStatusChange = async (newStatus) => {

    if (newStatus === status) return;

    setUpdating(true);

    try {

      const response = await fetch(
        `http://localhost:3001/api/orders/${order.orderNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error("Error actualizando estado");
      }

      setStatus(newStatus);

      alert(`Estado actualizado a ${newStatus}`);

    } catch (error) {

      console.error(error);

      alert("Error actualizando pedido");

    } finally {

      setUpdating(false);
    }
  };

  return (

    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">

      {/* HEADER */}

      <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">

              <Package className="w-5 h-5" />

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Pedido
              </p>

              <p className="text-2xl font-bold">
                #{order.orderNumber}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            {updating && (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
            )}

            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(e.target.value)
              }
              className={`border rounded-full px-4 py-2 text-sm font-semibold outline-none ${statusInfo.color}`}
            >

              <option value="confirmado">
                Confirmado
              </option>

              <option value="preparando">
                Preparando
              </option>

              <option value="enviado">
                Enviado
              </option>

              <option value="en_camino">
                En camino
              </option>

              <option value="entregado">
                Entregado
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* BODY */}

      <div className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* CLIENTE */}

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">

            <User className="w-5 h-5 text-gray-500" />

            <div>

              <p className="text-xs text-gray-500">
                Cliente
              </p>

              <p className="font-semibold">
                {order.customerName}
              </p>

            </div>

          </div>

          {/* TRACKING */}

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">

            <Hash className="w-5 h-5 text-gray-500" />

            <div>

              <p className="text-xs text-gray-500">
                Tracking
              </p>

              <p className="font-semibold">
                {order.tracking}
              </p>

            </div>

          </div>

          {/* FECHA */}

          {order.estimated_delivery && (

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">

              <Calendar className="w-5 h-5 text-gray-500" />

              <div>

                <p className="text-xs text-gray-500">
                  Entrega estimada
                </p>

                <p className="font-semibold">

                  {format(
                    new Date(order.estimated_delivery),
                    "d 'de' MMMM yyyy",
                    { locale: es }
                  )}

                </p>

              </div>

            </div>
          )}

          {/* TOTAL */}

          {order.total_amount && (

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">

              <DollarSign className="w-5 h-5 text-gray-500" />

              <div>

                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="font-semibold">
                  ${order.total_amount}
                </p>

              </div>

            </div>
          )}

        </div>

        {/* NOTAS */}

        {order.notes && (

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">

            <p className="text-sm text-blue-900 font-semibold mb-2">
              Información del pedido
            </p>

            <p className="text-blue-800">
              {order.notes}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}