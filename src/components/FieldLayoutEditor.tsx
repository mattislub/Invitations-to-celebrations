import { useEffect, useMemo, useState } from 'react'
import { MapPin, Plus, Type as TypeIcon, AlignLeft, AlignCenter, AlignRight, Ruler, Trash, StickyNote } from 'lucide-react'
import { CustomInvitationType, InvitationFieldLayout, InvitationFieldType, PositionedField } from '../types'
import { Language, getTranslation } from '../translations'

interface FieldLayoutEditorProps {
  language: Language
  customTypes: CustomInvitationType[]
  layouts: InvitationFieldLayout[]
  onLayoutsChange: (layouts: InvitationFieldLayout[]) => void
}

const createDefaultField = (language: Language): PositionedField => ({
  id: crypto.randomUUID(),
  labelHe: language === 'he' ? 'כותרת חדשה' : 'שדה חדש',
  labelEn: 'New Field',
  type: 'text',
  required: false,
  position: {
    x: 10,
    y: 10,
    width: 80,
    align: 'center'
  }
})

export default function FieldLayoutEditor({
  language,
  customTypes,
  layouts,
  onLayoutsChange
}: FieldLayoutEditorProps) {
  const t = getTranslation(language)
  const [selectedTypeId, setSelectedTypeId] = useState<string>(customTypes[0]?.id || '')

  useEffect(() => {
    if (!selectedTypeId && customTypes[0]) {
      setSelectedTypeId(customTypes[0].id)
    }
  }, [customTypes, selectedTypeId])

  useEffect(() => {
    if (!selectedTypeId) return
    const exists = layouts.some((layout) => layout.typeId === selectedTypeId)
    if (!exists) {
      const defaultField = createDefaultField(language)
      onLayoutsChange([...layouts, { typeId: selectedTypeId, fields: [defaultField], notes: '' }])
    }
  }, [layouts, language, onLayoutsChange, selectedTypeId])

  const selectedLayout = useMemo(
    () => layouts.find((layout) => layout.typeId === selectedTypeId),
    [layouts, selectedTypeId]
  )

  const updateLayout = (updater: (layout: InvitationFieldLayout) => InvitationFieldLayout) => {
    if (!selectedTypeId || !selectedLayout) return
    onLayoutsChange(
      layouts.map((layout) => (layout.typeId === selectedTypeId ? updater(layout) : layout))
    )
  }

  const handleAddField = () => {
    if (!selectedLayout) return
    const baseField = createDefaultField(language)
    updateLayout((layout) => ({
      ...layout,
      fields: [
        ...layout.fields,
        {
          ...baseField,
          position: {
            ...baseField.position,
            y: Math.min(90, 10 + layout.fields.length * 10)
          }
        }
      ]
    }))
  }

  const updateField = (id: string, partial: Partial<PositionedField>) => {
    updateLayout((layout) => ({
      ...layout,
      fields: layout.fields.map((field) =>
        field.id === id ? { ...field, ...partial } : field
      )
    }))
  }

  const updatePosition = (id: string, key: 'x' | 'y' | 'width', value: number) => {
    updateLayout((layout) => ({
      ...layout,
      fields: layout.fields.map((field) =>
        field.id === id
          ? { ...field, position: { ...field.position, [key]: Math.min(100, Math.max(0, value)) } }
          : field
      )
    }))
  }

  const updateAlignment = (id: string, align: PositionedField['position']['align']) => {
    updateLayout((layout) => ({
      ...layout,
      fields: layout.fields.map((field) =>
        field.id === id ? { ...field, position: { ...field.position, align } } : field
      )
    }))
  }

  const removeField = (id: string) => {
    updateLayout((layout) => ({
      ...layout,
      fields: layout.fields.filter((field) => field.id !== id)
    }))
  }

  if (customTypes.length === 0) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center text-gray-600">
        {t.admin.messages.empty}
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
      <aside className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-amber-600" />
          <div>
            <p className="text-sm text-gray-500">{t.admin.fieldLayout.selectType}</p>
            <h3 className="text-lg font-semibold text-gray-800">{t.admin.sections.fieldLayout.title}</h3>
          </div>
        </div>
        <div className="space-y-3">
          {customTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedTypeId(type.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                selectedTypeId === type.id
                  ? 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm'
                  : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/50 text-gray-700'
              }`}
            >
              <span className="font-semibold">{language === 'he' ? type.nameHe : type.nameEn}</span>
              <span className="text-sm text-gray-500">{type.nameEn}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-4 text-sm text-amber-800">
          {t.admin.fieldLayout.previewHint}
        </div>
      </aside>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <TypeIcon className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="text-xl font-bold text-gray-800">{t.admin.sections.fieldLayout.title}</h4>
                <p className="text-sm text-gray-600">{t.admin.sections.fieldLayout.description}</p>
              </div>
            </div>
            <button
              onClick={handleAddField}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t.admin.fieldLayout.addField}
            </button>
          </div>

          {!selectedLayout || selectedLayout.fields.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">{t.admin.fieldLayout.empty}</p>
          ) : (
            <div className="grid gap-3">
              {selectedLayout.fields.map((field) => (
                <div key={field.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                      <input
                        value={field.labelHe}
                        onChange={(e) => updateField(field.id, { labelHe: e.target.value })}
                        placeholder={t.admin.fields.labelHe}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-right"
                      />
                      <input
                        value={field.labelEn}
                        onChange={(e) => updateField(field.id, { labelEn: e.target.value })}
                        placeholder={t.admin.fields.labelEn}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title={t.admin.buttons.delete}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">{t.admin.fields.fieldType}</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as InvitationFieldType })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="text">{t.admin.fieldLayout.typeOptions.text}</option>
                        <option value="date">{t.admin.fieldLayout.typeOptions.date}</option>
                        <option value="time">{t.admin.fieldLayout.typeOptions.time}</option>
                        <option value="location">{t.admin.fieldLayout.typeOptions.location}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">{t.admin.fields.positionX}</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={field.position.x}
                        onChange={(e) => updatePosition(field.id, 'x', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">{t.admin.fields.positionY}</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={field.position.y}
                        onChange={(e) => updatePosition(field.id, 'y', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">{t.admin.fields.width}</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={field.position.width}
                        onChange={(e) => updatePosition(field.id, 'width', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Ruler className="w-4 h-4 text-amber-600" />
                      <span>{field.position.x}% / {field.position.y}% • {field.position.width}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-gray-700">{t.admin.fields.alignment}</label>
                      <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                          onClick={() => updateAlignment(field.id, 'left')}
                          className={`px-3 py-2 ${field.position.align === 'left' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.admin.fieldLayout.alignmentOptions.left}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateAlignment(field.id, 'center')}
                          className={`px-3 py-2 ${field.position.align === 'center' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.admin.fieldLayout.alignmentOptions.center}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateAlignment(field.id, 'right')}
                          className={`px-3 py-2 ${field.position.align === 'right' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.admin.fieldLayout.alignmentOptions.right}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      />
                      {t.admin.fields.required}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedLayout && (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h5 className="font-semibold text-gray-800">{t.templateEditor.preview}</h5>
              </div>
              <div className="relative bg-gradient-to-br from-white to-amber-50 border border-dashed border-amber-200 rounded-xl h-96 overflow-hidden">
                {selectedLayout.fields.map((field) => (
                  <div
                    key={field.id}
                    className="absolute bg-white/80 border border-amber-300 rounded-lg px-3 py-2 text-sm shadow-sm"
                    style={{
                      left: `${field.position.x}%`,
                      top: `${field.position.y}%`,
                      width: `${field.position.width}%`,
                      transform: 'translate(-50%, -50%)',
                      textAlign: field.position.align as 'left' | 'center' | 'right'
                    }}
                  >
                    <p className="font-semibold text-amber-800">{language === 'he' ? field.labelHe : field.labelEn}</p>
                    <p className="text-xs text-amber-700 capitalize">
                      {t.admin.fieldLayout.typeOptions[field.type]}
                      {field.required && ' *'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-gray-700" />
                <h5 className="font-semibold text-gray-800">{t.admin.fields.layoutNotes}</h5>
              </div>
              <textarea
                value={selectedLayout.notes || ''}
                onChange={(e) =>
                  updateLayout((layout) => ({
                    ...layout,
                    notes: e.target.value
                  }))
                }
                placeholder={t.admin.fieldLayout.notesPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[160px] text-right"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
