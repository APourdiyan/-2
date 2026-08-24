import L from 'leaflet';
import { toPersianDigits } from '../../utils/persianUtils';

/**
 * تعیین کلاس ابعاد و استایل کلاستر بر اساس تعداد نقاط در هر خوشه
 * - کوچک: ۱ تا ۵
 * - متوسط: ۶ تا ۱۵
 * - بزرگ: ۱۶ به بالا
 */
export const getClusterSizeClass = (count: number): {
  className: string;
  size: number;
} => {
  if (count >= 16) {
    return { className: 'cluster-large', size: 52 };
  } else if (count >= 6) {
    return { className: 'cluster-medium', size: 44 };
  } else {
    return { className: 'cluster-small', size: 36 };
  }
};

/**
 * سازنده آیکون سفارشی خوشه‌بندی کلاستر با رنگ شاخص #0E7C86 و اعداد فارسی
 */
export const createDezfulClusterIcon = (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();
  const persianCount = toPersianDigits(count);
  const { className, size } = getClusterSizeClass(count);

  const html = `
    <div class="dezful-map-cluster ${className}" style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #0E7C86 0%, #095961 100%);
      border: 3px solid rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 800;
      font-family: 'Vazirmatn', sans-serif;
      box-shadow: 0 4px 14px rgba(14, 124, 134, 0.45);
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <span style="font-size: ${size > 44 ? '15px' : size > 36 ? '13px' : '12px'}; line-height: 1;">
        ${persianCount}
      </span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'dezful-cluster-wrapper',
    iconSize: L.point(size, size),
    iconAnchor: [size / 2, size / 2]
  });
};

export default createDezfulClusterIcon;
