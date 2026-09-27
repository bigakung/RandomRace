import { MAX_PARTICIPANTS, MIN_PARTICIPANTS } from '../features/picker/roster'
import type { SessionError, SessionNotice } from '../features/session/pickerSession'

export const copy = {
  appTitle: 'อยุธยา',
  appSubtitle: 'Random Picker',
  rosterHeading: 'รายชื่อผู้เข้าแข่ง',
  addNameLabel: 'เพิ่มชื่อ',
  addNamePlaceholder: 'พิมพ์ชื่อ หรือวางหลายบรรทัด',
  addNameButton: 'เพิ่ม',
  emptyRoster: 'ยังไม่มีรายชื่อ — พิมพ์ชื่อด้านบน หรือวางรายชื่อหลายบรรทัดได้เลย',
  participantCount: (count: number) => `${count} / ${MAX_PARTICIPANTS} คน`,
  duplicateBadge: 'ชื่อซ้ำ',
  editNameLabel: (number: number) => `แก้ชื่อ #${number}`,
  editButton: (number: number, name: string) => `แก้ไข #${number} ${name}`,
  deleteButton: (number: number, name: string) => `ลบ #${number} ${name}`,
  saveEdit: 'บันทึก',
  cancelEdit: 'ยกเลิก',
  clearAll: 'ล้างทั้งหมด',
  confirmClearAll: (count: number) => `ล้างรายชื่อทั้ง ${count} คน?`,
  raceDurationLabel: 'ความยาวการแข่ง',
  raceDuration: (ms: number) => (ms < 60_000 ? `${ms / 1000} วิ` : `${ms / 60_000} นาที`),
  startHint: `ต้องมีอย่างน้อย ${MIN_PARTICIPANTS} คนจึงจะเริ่มแข่งได้`,
  start: { th: 'เริ่มแข่ง', en: 'START RACE' },
  winnerHeading: '🏆 ผู้ชนะ',
  playAgain: { th: 'แข่งอีกครั้ง', en: 'PLAY AGAIN' },
  editNames: { th: 'แก้ไขรายชื่อ', en: 'EDIT NAMES' },
  newRace: { th: 'เริ่มใหม่', en: 'NEW RACE' },
  confirmClear: 'ล้างรายชื่อ',
  go: 'GO!',
  skip: 'ข้ามไปดูผล ⏭',
  sound: 'เสียง',
  leadersTitle: 'นำอยู่',
  soundOn: 'เปิดเสียง',
  soundOff: 'ปิดเสียง',
  themeLabel: 'ธีม',
  reducedMotionNote: 'โหมดลดการเคลื่อนไหว: แสดงผลทันที',
  fallback2d: 'อุปกรณ์นี้แสดงแบบ 3D ไม่ได้ — แสดงการแข่งแบบ 2D แทน',
  error: (error: SessionError): string => {
    switch (error.code) {
      case 'not-enough-participants':
        return `ต้องมีผู้เข้าแข่งอย่างน้อย ${MIN_PARTICIPANTS} คนจึงจะเริ่มได้`
      case 'empty-name':
        return 'ชื่อต้องไม่เว้นว่าง'
    }
  },
  notice: (notice: SessionNotice): string =>
    `ใส่ได้สูงสุด ${MAX_PARTICIPANTS} คน — ตัดออก ${notice.dropped} ชื่อ`,
} as const
