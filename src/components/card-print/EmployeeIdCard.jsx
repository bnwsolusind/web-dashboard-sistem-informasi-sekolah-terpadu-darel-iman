import EmployeeCardHorizontal from './EmployeeCardHorizontal'
import EmployeeCardVertical from './EmployeeCardVertical'
import EmployeeCardBackHorizontal from './EmployeeCardBackHorizontal'
import EmployeeCardBackVertical from './EmployeeCardBackVertical'

export default function EmployeeIdCard({
 orientation = 'horizontal',
 employee,
 template = 'green',
 pengaturan = {},
 formatDate,
 qrPayload,
 isPrint = false,
 isEditing = false,
 layoutConfig = {},
 frameStyle = 'standard',
 photoShape = 'rounded',
 showPattern = true,
 showWave = true,
 headerMotto,
 footerMotto,
 cardSide = 'front',
 backTitle = 'KETENTUAN KARTU PEGAWAI',
 backRules,
 backAddress,
 backShowQr = true,
 onElementMove,
}) {
 const cardProps = {
 employee,
 template,
 pengaturan,
 formatDate,
 qrPayload,
 isPrint,
 isEditing,
 layoutConfig,
 frameStyle,
 photoShape,
 showPattern,
 showWave,
 headerMotto,
 footerMotto,
 backTitle,
 backRules,
 backAddress,
 backShowQr,
 onElementMove,
 }

 if (cardSide === 'back') {
 if (orientation === 'horizontal') {
 return <EmployeeCardBackHorizontal {...cardProps} />
 }
 return <EmployeeCardBackVertical {...cardProps} />
 }

 if (orientation === 'horizontal') {
 return <EmployeeCardHorizontal {...cardProps} />
 }

 return <EmployeeCardVertical {...cardProps} />
}

