import StudentCardHorizontal from './StudentCardHorizontal'
import StudentCardVertical from './StudentCardVertical'
import StudentCardBackHorizontal from './StudentCardBackHorizontal'
import StudentCardBackVertical from './StudentCardBackVertical'

export default function StudentIdCard({
 data,
 config = {},
 theme = {},
 pengaturan = {},
 qrToken = '',
 formatDate,
 isPrint = false,
 cardSide = 'front',
 backTitle = 'TATA TERTIB SISWA',
 backRules,
 backAddress,
 frameStyle = 'standard',
 photoShape = 'rounded',
 showPattern = true,
 showWave = true,
 headerMotto,
 footerMotto,
 backShowQr = true,
}) {
 const orientation = config.orientation || 'horizontal'

 const cardProps = {
 data,
 config,
 theme,
 pengaturan,
 qrToken,
 formatDate,
 isPrint,
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
 }

 if (cardSide === 'back') {
 if (orientation === 'horizontal') {
 return <StudentCardBackHorizontal {...cardProps} />
 }
 return <StudentCardBackVertical {...cardProps} />
 }

 if (orientation === 'horizontal') {
 return <StudentCardHorizontal {...cardProps} />
 }

 return <StudentCardVertical {...cardProps} />
}
