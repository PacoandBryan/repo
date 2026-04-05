import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, ToggleLeft, ToggleRight, Calendar, AlertCircle } from 'lucide-react';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, getProducts } from '../../services/AdminApi';

interface Promotion {
    id: number;
    product_id: number;
    label: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    created_at: string;
}

interface Product {
    id: number;
    title: string;
    price: number;
}

const emptyForm = {
    product_id: 0,
    label: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    starts_at: '',
    ends_at: '',
    is_active: true,
};

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const productMap = React.useMemo(() => {
        const m: Record<number, Product> = {};
        products.forEach((p) => (m[p.id] = p));
        return m;
    }, [products]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [promoRes, prodRes] = await Promise.all([getPromotions(), getProducts()]);
            setPromotions(promoRes.promotions || []);
            setProducts(prodRes || []);
        } catch (e: any) {
            setError(e.message || 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openCreate = () => {
        setEditingPromo(null);
        setForm({ ...emptyForm, product_id: products[0]?.id || 0 });
        setShowModal(true);
    };

    const openEdit = (promo: Promotion) => {
        setEditingPromo(promo);
        setForm({
            product_id: promo.product_id,
            label: promo.label,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            starts_at: promo.starts_at ? promo.starts_at.slice(0, 16) : '',
            ends_at: promo.ends_at ? promo.ends_at.slice(0, 16) : '',
            is_active: promo.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.product_id || !form.label || form.discount_value <= 0) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                starts_at: form.starts_at || null,
                ends_at: form.ends_at || null,
            };
            if (editingPromo) {
                await updatePromotion(editingPromo.id, payload);
            } else {
                await createPromotion(payload);
            }
            setShowModal(false);
            loadData();
        } catch (e: any) {
            setError(e.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta promoción?')) return;
        try {
            await deletePromotion(id);
            loadData();
        } catch (e: any) {
            setError(e.message || 'Error al eliminar');
        }
    };

    const handleToggleActive = async (promo: Promotion) => {
        try {
            await updatePromotion(promo.id, { is_active: !promo.is_active });
            loadData();
        } catch (e: any) {
            setError(e.message || 'Error al actualizar');
        }
    };

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-[#ff6b9a]" />
                        Administrar Promociones
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Crea y administra descuentos por tiempo limitado en tus productos.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-[#ff6b9a] hover:bg-[#e55e8a] text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Promoción
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Cargando...</div>
            ) : promotions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay promociones aún.</p>
                    <button onClick={openCreate} className="mt-3 text-[#ff6b9a] font-semibold hover:underline text-sm">Crear la primera</button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Etiqueta</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Descuento</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                                    <Calendar className="w-4 h-4 inline mr-1" />Inicio
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                                    <Calendar className="w-4 h-4 inline mr-1" />Fin
                                </th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Activa</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {productMap[promo.product_id]?.title || `ID ${promo.product_id}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center bg-[#ff6b9a]/10 text-[#ff6b9a] text-xs font-bold uppercase px-2 py-0.5 rounded-full">
                                            {promo.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-700">
                                        {promo.discount_type === 'percentage'
                                            ? `${promo.discount_value}%`
                                            : `$${promo.discount_value} MXN`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(promo.starts_at)}</td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(promo.ends_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleToggleActive(promo)} title="Toggle active">
                                            {promo.is_active
                                                ? <ToggleRight className="w-6 h-6 text-[#ff6b9a] mx-auto" />
                                                : <ToggleLeft className="w-6 h-6 text-gray-300 mx-auto" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(promo)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                                )}
                                {/* Product */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Producto *</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                        value={form.product_id}
                                        onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                                    >
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>{p.title} – ${p.price}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Label */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Etiqueta *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                        placeholder="ej. Flash Sale 🔥, Oferta de Fin de Semana"
                                        value={form.label}
                                        onChange={(e) => setForm({ ...form, label: e.target.value })}
                                    />
                                </div>
                                {/* Discount type & value */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de descuento</label>
                                        <select
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                            value={form.discount_type}
                                            onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                        >
                                            <option value="percentage">Porcentaje (%)</option>
                                            <option value="fixed">Monto fijo ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Valor {form.discount_type === 'percentage' ? '(%)' : '($)'} *
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={form.discount_type === 'percentage' ? 1 : 0.01}
                                            max={form.discount_type === 'percentage' ? 100 : undefined}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                            value={form.discount_value}
                                            onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio (opcional)</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                            value={form.starts_at}
                                            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Fin (opcional)</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b9a]/30"
                                            value={form.ends_at}
                                            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {/* Active toggle */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700">Activa</span>
                                    <button
                                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className="transition-colors"
                                    >
                                        {form.is_active
                                            ? <ToggleRight className="w-8 h-8 text-[#ff6b9a]" />
                                            : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-[#ff6b9a] hover:bg-[#e55e8a] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando…' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
