import React, { useEffect, useState, useMemo } from "react";
import { auth, db } from "../../firebase.config";
import { ref, onValue } from "firebase/database";
import Barcode from "react-barcode";
import { Printer, Loader2, Tag, Search, CheckCircle2 } from "lucide-react";

export default function BarcodePrinter() {
  const [loading, setLoading] = useState(true);
  const [barcodeList, setBarcodeList] = useState([]);
  const [selected, setSelected] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

        const bizId = localStorage.getItem("active_business_id");


    const barcodeRef = ref(db, `businessData/${bizId}/barcode`);
    const inventoryRef = ref(db, `businessData/${bizId}/inventory`);

    onValue(barcodeRef, (snapshot) => {
      const barcodeData = snapshot.val() || {};

      onValue(inventoryRef, (invSnapshot) => {
          const invData = invSnapshot.val() || {};
          const combined = Object.keys(barcodeData).map((id) => ({
            id,
            sku: barcodeData[id].barcode,
            name: invData[barcodeData[id].barcode]?.product || "Unknown Product",
          }));

          setBarcodeList(combined);

          // Default all to selected initially
          const defaultSelect = {};
          combined.forEach((item) => (defaultSelect[item.id] = true));
          setSelected(defaultSelect);
          setLoading(false);
        }, { onlyOnce: true }
      );
    });
  }, [user]);

  // Filtered list based on search query
  const filteredBarcodes = useMemo(() => {
    return barcodeList.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, barcodeList]);

  const toggleSelect = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    const selectedItems = barcodeList.filter((item) => selected[item.id]);
    if (!selectedItems.length) return alert("Select at least one product to print.");

    const printWindow = window.open("", "", "width=900,height=700");
    const labelsHTML = selectedItems.map((item) => `
        <div class="print-page">
          <div class="label-grid">
            ${Array.from({ length: 21 }).map(() => `
                <div class="label-item">
                  <p class="label-name">${item.name}</p>
                  <svg class="barcode" jsbarcode-value="${item.sku}"></svg>
                </div>
              `).join("")}
          </div>
        </div>
      `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode/dist/JsBarcode.all.min.js"></script>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            .print-page { page-break-after: always; padding: 40px; }
            .label-grid { display: grid; grid-template-columns: repeat(3, 1fr);  }
            .label-item { text-align: center; border-width: 2px; padding: 0px 10px;
                            border-style: dashed;
                            border-color: #cbd5e1; }
            .label-name { font-size: 10px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          ${labelsHTML}
          <script>
            JsBarcode(".barcode").init();
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Label Station</h2>
          <p className="text-sm text-slate-500 font-medium">Search and select items to generate print sheets.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search product or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg text-sm shrink-0"
          >
            <Printer size={18} /> Print Labels
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-col-3 lg:grid-cols-4 gap-4">
        {filteredBarcodes.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            className={`group relative border-2 border-slate-200 p-5 rounded-2xl cursor-pointer transition-all duration-200 `}
          >
            {/* Selection Indicator */}
            <div className={`absolute top-3 right-3 transition-opacity ${selected[item.id] ? "opacity-100" : "opacity-0"}`}>
              <CheckCircle2 size={20} className="text-black-800 fill-white" />
            </div>

            <div className="pr-6">
                <p className={`text-xs font-black uppercase tracking-tight truncate text-slate-800`}>
                    {item.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mb-3">{item.sku}</p>
            </div>

            <div className={`flex justify-center p-2 rounded-lg transition-colors ${selected[item.id] ? "bg-white" : "bg-slate-50"}`}>
              <Barcode
                value={item.sku}
                width={1}
                height={40}
                fontSize={0} // Hide text in preview to keep it clean
                margin={0}
                background="transparent"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty / Not Found States */}
      {filteredBarcodes.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Tag className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold tracking-tight">
            {barcodeList.length === 0 ? "Your barcode library is empty." : "No matching products found."}
          </p>
        </div>
      )}
    </div>
  );
}