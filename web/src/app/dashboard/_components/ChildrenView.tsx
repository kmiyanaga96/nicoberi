import { Building, Plus, Users, Save, Trash2, ChevronDown } from 'lucide-react'
import { upsertFacility, deleteFacility, upsertChild, deleteChild } from '../actions'
import { AutoCloseDetails } from '@/app/components/AutoCloseDetails'
import { ConfirmButton } from '@/app/components/ConfirmButton'
import { FormField, FormSelect } from '@/app/components/FormField'

export function ChildrenView({ typedChildren, typedFacilities }: { typedChildren: any[]; typedFacilities: any[] }) {
  return (
    <div className="space-y-6 pb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 施設・学校の登録 */}
      <div className="glass border border-white/20 dark:border-white/10 rounded-3xl p-6">
        <details className="group bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-primary">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" /> 預かり所・学校の登録
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-5 pt-0 border-t border-primary/10 bg-background/50 space-y-6 mt-4">
            <form action={upsertFacility} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField label="施設・学校名" name="name" required placeholder="例: 第一小学校" className="md:col-span-2" />
                <FormField label="住所" name="address" placeholder="例: 千葉県浦安市..." className="md:col-span-3" />
              </div>
              <div className="flex justify-start">
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2 rounded-xl transition-colors shadow-m text-sm">追加する</button>
              </div>
            </form>

            <div className="space-y-2 mt-6">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-3 border-b border-border/50 pb-1">登録されている施設</h3>
              {typedFacilities.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 bg-secondary/20 rounded-xl">まだ登録されていません。上のフォームから登録してください。</p>
              ) : (
                typedFacilities.map(f => (
                  <AutoCloseDetails key={f.id} className="group glass rounded-2xl border border-white/10 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                    summaryClassName="px-4 py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    summaryContent={<>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0"><Building className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-sm block">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{f.address || '住所未設定'}</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                    </>}
                  >
                    <div className="p-5 pt-4 border-t border-border/50 bg-background/50">
                      <form action={upsertFacility} className="flex flex-col gap-4">
                        <input type="hidden" name="id" value={f.id} />
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <FormField label="施設・学校名" name="name" defaultValue={f.name} required className="md:col-span-2" />
                          <FormField label="住所" name="address" defaultValue={f.address || ''} className="md:col-span-3" />
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                          <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-1.5 rounded-xl transition-colors shadow-m text-sm">変更を保存</button>
                          <form action={deleteFacility}>
                            <input type="hidden" name="facilityId" value={f.id} />
                            <ConfirmButton message={`${f.name} を削除しますか？\n(既に紐づいている児童からは施設情報のみ解除されます)`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-md text-[10px] font-bold bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500/20">
                              <Trash2 className="w-3.5 h-3.5" />この施設を削除
                            </ConfirmButton>
                          </form>
                        </div>
                      </form>
                    </div>
                  </AutoCloseDetails>
                ))
              )}
            </div>
          </div>
        </details>
      </div>

      {/* 児童名簿 */}
      <div className="glass border border-white/20 dark:border-white/10 rounded-3xl p-6">
        {/* 新規登録フォーム */}
        <details className="mb-6 group bg-primary/10 border border-primary/20 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-primary">
            <div className="flex items-center gap-2"><Plus className="w-5 h-5" /> 新規児童の登録</div>
          </summary>
          <div className="p-5 pt-0 border-t border-primary/10 bg-background/50">
            <form action={upsertChild} className="flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="姓" name="last_name" required />
                <FormField label="名" name="first_name" required />
                <FormField label="セイ" name="sei" />
                <FormField label="メイ" name="mei" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="生年月日" name="birthdate" type="date" />
                <FormSelect label="性別" name="gender" options={[{ value: '男', label: '男' }, { value: '女', label: '女' }]} />
                <FormField label="受給者証番号" name="recipient_number" />
                <FormField label="支援区分" name="disability_level" type="number" />
              </div>
              <FormField label="スタッフ共有事項" name="notes" type="textarea" />
              <FormField label="非公開配慮事項 (管理者等のみ)" name="medical_notes" type="textarea" />
              <button type="submit" className="self-start bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-8 rounded-xl transition-all shadow-md active:scale-95">登録を完了する</button>
            </form>
          </div>
        </details>

        {/* 既存児童一覧 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 ml-2">
            <Users className="w-5 h-5 text-muted-foreground" /> 登録済み児童名簿
          </h2>
          {typedChildren.map((child) => (
            <AutoCloseDetails key={child.id}
              className="group bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              summaryClassName="flex items-center justify-between cursor-pointer p-4 font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              summaryContent={<>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">{child.last_name[0]}{child.first_name[0]}</div>
                  <div>
                    <span>{child.last_name} {child.first_name}</span>
                    <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">{child.sei} {child.mei}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </>}
            >
              <div className="p-5 pt-4 border-t border-border/50 bg-background/50">
                <form action={upsertChild} className="flex flex-col gap-4">
                  <input type="hidden" name="id" value={child.id} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="姓" name="last_name" defaultValue={child.last_name} required />
                    <FormField label="名" name="first_name" defaultValue={child.first_name} required />
                    <FormField label="セイ" name="sei" defaultValue={child.sei || ''} />
                    <FormField label="メイ" name="mei" defaultValue={child.mei || ''} />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="生年月日" name="birthdate" type="date" defaultValue={child.birthdate || ''} />
                    <FormSelect label="性別" name="gender" defaultValue={child.gender || '男'} options={[{ value: '男', label: '男' }, { value: '女', label: '女' }]} />
                    <FormField label="受給者証番号" name="recipient_number" defaultValue={child.recipient_number || ''} />
                    <FormField label="支援区分" name="disability_level" type="number" defaultValue={child.disability_level || ''} />
                  </div>
                  <FormField label="スタッフ共有事項" name="notes" type="textarea" defaultValue={child.notes || ''} />
                  <FormField label="非公開配慮事項" name="medical_notes" type="textarea" defaultValue={child.medical_notes || ''} />
                  <div className="flex justify-between items-center mt-2">
                    <button type="submit" className="flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold py-2 px-6 rounded-xl transition-all">
                      <Save className="w-4 h-4" /> 変更を保存
                    </button>
                  </div>
                </form>
                <form action={deleteChild} className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                  <input type="hidden" name="childId" value={child.id} />
                  <ConfirmButton message={`${child.last_name} ${child.first_name} を名簿から完全に削除しますか？\nこの操作は取り消せません。`} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-bold hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors border border-red-500/30 bg-transparent">
                    <Trash2 className="w-3.5 h-3.5" /> この児童を削除
                  </ConfirmButton>
                </form>
              </div>
            </AutoCloseDetails>
          ))}
        </div>
      </div>
    </div>
  )
}
