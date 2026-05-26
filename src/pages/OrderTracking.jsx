import { useState } from 'react';
import logo from "../assets/logo.png";
import {
  PackageCheck,
  ClipboardList,
  Truck,
  CheckCircle2,
  Search
} from 'lucide-react';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // =========================================
  // UTILS & PARSERS
  // =========================================

  const normalize = (text) => 
    String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const parseCSV = (text) => 
    text.split("\n").map((line) =>
      line.split(/,(?=(?:(?:[^"]*"){2})*[^utf8]*$)/).map((cell) => 
        cell.replace(/^"|"$/g, "").trim()
      )
    );

  const getProductoSimple = (descripcion) => {
    const text = String(descripcion || "").toUpperCase();
    const medidaMatch = text.match(/\d{3}\/\d{2}R\d{2}/) || text.match(/\d{3}\/\d{2}-\d{2}/);

    const marcas = [
      "DUNLOP", "GOODYEAR", "MICHELIN", "PIRELLI", "BRIDGESTONE",
      "WANDA", "FALKEN", "ROADX", "APTANY", "CONTINENTAL", "MAXXIS"
    ];

    return {
      familia: "Neumático",
      marca: marcas.find((m) => text.includes(m)) || "",
      medida: medidaMatch ? medidaMatch[0] : ""
    };
  };

  const getTimelineStep = (row) => {
    const preparacion = normalize(row[49]); // AX
    const estado = normalize(row[48]);     // AW
    const fechaEntrega = normalize(row[56]); // BE

    if (fechaEntrega && !["", "revisar", "no aplica"].includes(fechaEntrega)) return 4;
    if (preparacion.includes("enviado") || estado.includes("despachado")) return 3;
    if (["empaquetado", "creado", "picking"].some(palabra => preparacion.includes(palabra))) return 2;
    
    return 1;
  };

  // =========================================
  // API & HANDLERS
  // =========================================

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Ingresa un número de pedido');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`http://localhost:3001/track-order?orderNumber=${orderNumber}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      const found = data.order;

      if (!found) {
        setError('No encontramos tu pedido');
        return;
      }

      setOrder({
        orderNumber: found[1],
        customerName: found[5],
        direccion: found[29] !== "NO APLICA" ? found[29] : found[12],
        comuna: found[30] !== "NO APLICA" ? found[30] : found[13],
        ciudad: found[31] !== "NO APLICA" ? found[31] : "",
        producto: getProductoSimple(`${found[17]} ${found[18]}`),
        courier: found[34],
        conductor: found[60],
        ruta: found[37],
        odt: found[58],
        fechaCreacion: found[52],
        fechaPicking: found[54],
        fechaDespacho: found[55],
        fechaEntrega: found[56],
        estado: found[48],
        preparacion: found[49],
        timeline: getTimelineStep(found)
      });
    } catch (err) {
      setError('No encontramos tu pedido o hubo un error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // STEPS CONFIGURATION
  // =========================================

  const currentStep = order ? order.timeline : 1;

  const steps = [
    { title: 'Pedido recibido', icon: PackageCheck, text: "Pedido recibido ✅" },
    { title: 'En preparación', icon: ClipboardList, text: "Estamos preparando tu pedido 📦" },
    { title: 'En Camino', icon: Truck, text: "Tu pedido va en camino 🚚" },
    { title: 'Entregado', icon: CheckCircle2, text: "Pedido entregado exitosamente ✅" }
  ];

  const currentStepInfo = steps[currentStep - 1] || steps[0];

  // =========================================
  // RENDER
  // =========================================

  return (
    <div
      className="min-h-screen py-4 px-4 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop')"
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="bg-yellow-400 rounded-t-3xl px-8 py-5 border-b-4 border-black shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <img src={logo} alt="Logo empresa" className="w-40 md:w-72 object-contain drop-shadow-xl" />
            <div>
              <h1
                className="text-2xl md:text-5xl font-black uppercase leading-none tracking-tight text-center md:text-left"
                style={{
                  color: "#000",
                  textShadow: `2px 2px 0px #facc15, 4px 4px 0px rgba(0,0,0,0.25)`,
                  fontFamily: "Arial Black, sans-serif"
                }}
              >
                Seguimiento de tu compra
              </h1>
              <p className="text-black/80 mt-2 text-lg font-medium">
                Consulta el estado de tu pedido en tiempo real
              </p>
            </div>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-5 shadow-sm rounded-b-3xl">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Ingresa tu número de pedido"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="flex-1 border-2 border-yellow-400 bg-white rounded-2xl px-5 py-4 text-lg outline-none focus:ring-4 focus:ring-yellow-300 transition-all"
            />
            <button
              onClick={handleSearch}
              className="bg-black hover:bg-yellow-400 hover:text-black text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:scale-105 border-2 border-black"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Buscando pedido...</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-5 rounded-2xl mt-8">{error}</div>
          )}

          {/* RESULTADO */}
          {order && (
            <div className="mt-5">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden h-full flex flex-col">
                
                {/* TOP */}
                <div className="border-b border-gray-200 px-8 py-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="text-gray-500 text-sm">Pedido</p>
                      <h2 className="text-4xl font-bold text-gray-900">#{order.orderNumber}</h2>
                    </div>
                    <div className="bg-yellow-400/50 backdrop-blur-sm text-black px-5 py-3 rounded-2xl font-bold text-lg border border-yellow-200/40">
                      {currentStepInfo.text}
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="grid md:grid-cols-2 gap-4 p-5">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Cliente</p>
                    <p className="text-xl font-semibold">{order.customerName}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Dirección de entrega</p>
                    <p className="text-lg font-semibold">{order.direccion}</p>
                    <p className="text-gray-500">{order.comuna} - {order.ciudad}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 mb-2">Producto</p>
                    <p className="text-xl font-bold">{order.producto.familia}</p>
                    {order.producto.marca && <p className="text-gray-700 mt-2">Marca: {order.producto.marca}</p>}
                    {order.producto.medida && <p className="text-gray-500">Medida: {order.producto.medida}</p>}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Transporte</p>
                    <p className="text-xl font-semibold">{order.courier}</p>

                    {order.courier?.toUpperCase().includes("PDQ") && order.odt && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Tu envío con PDQ Número de seguimiento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="font-bold text-lg text-black">{order.odt}</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(order.odt)}
                            className="text-xs bg-black hover:bg-yellow-400 hover:text-black text-white px-3 py-1 rounded-lg transition-all duration-300 font-semibold"
                          >
                            Copiar
                          </button>
                        </div>
                        <a
                          href="https://www.pdq.cl/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition-all duration-300"
                        >
                          Seguir envío en PDQ
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="px-5 pb-5">
                  <h3 className="text-xl font-bold mb-6">Estado del envío</h3>
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
                    <div
                      className="absolute top-6 left-0 h-1 bg-yellow-400 rounded-full transition-all duration-1000 overflow-hidden"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="shine-effect"></div>
                      </div>
                    </div>

                    {steps.map((step, index) => {
                      const stepNumber = index + 1;
                      const active = stepNumber <= currentStep;
                      const current = stepNumber === currentStep;
                      const Icon = step.icon;

                      return (
                        <div key={step.title} className="relative z-10 flex flex-col items-center flex-1">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                              active
                                ? `bg-yellow-400 border-yellow-400 text-black shadow-[0_10px_30px_rgba(250,204,21,0.45)] scale-110 ${current ? 'animate-pulse' : ''}`
                                : 'bg-white border-gray-300 text-gray-400'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className={`mt-4 text-sm font-bold text-center leading-tight max-w-[110px] ${active ? 'text-black' : 'text-gray-400'}`}>
                            {step.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DETALLE */}
                <div className="bg-blue-50 border-t border-blue-100 px-8 py-6">
                  <p className="text-blue-900 font-bold mb-3">Información del pedido</p>
                  <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Estado actual:</strong> {currentStepInfo.text.replace(/✅|📦|🚚/g, "")}</p>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {(currentStep === 4
                        ? order.fechaEntrega || order.fechaDespacho
                        : currentStep === 3
                        ? order.fechaDespacho || order.fechaPicking
                        : currentStep === 2
                        ? order.fechaPicking || order.fechaCreacion
                        : order.fechaCreacion
                      )?.split(" ")[0]}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ANIMACIÓN */}
      <style>{`
        @keyframes shineMove {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
        .shine-effect {
          position: absolute;
          top: 0; left: 0; width: 120px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
          animation: shineMove 1.8s linear infinite;
          filter: blur(2px);
        }
      `}</style>
    </div>
  );
}