// ============================================================
//  CAFE & PUB INFOGRAPHIC — FILE CẤU HÌNH
//  Chỉnh sửa file này để cập nhật nội dung trang web
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // THÔNG TIN CHUNG
  // ----------------------------------------------------------
  brand: {
    name: "Mới",              // Tên thương hiệu
    tagline: "Cafe · Pub · Trải nghiệm",  // Slogan phụ
    description: "17/575 Kim Mã, Hà Nội",
    accentColor: "#C8854A",         // Màu nhấn chính (hex)
    darkColor: "#1A1208",           // Màu nền tối
  },

  // ----------------------------------------------------------
  // MÔ HÌNH KINH DOANH
  // ----------------------------------------------------------
  businessModels: [
    {
      title: "Cafe ban ngày",
      hours: "07:00 – 17:00",
      items: ["Cà phê, trà, nước ép", "Không gian yên tĩnh", "Wifi tốc độ cao"],
      color: "#C8854A",             // Màu thẻ
      icon: "☕",
    },
    {
      title: "Pub ban đêm",
      hours: "17:00 – 23:00",
      items: ["Bia, rượu, cocktail, đồ nhậu", "Happy hour 17–19h"],
      color: "#7B5EA7",
      icon: "🍺",
    },
    {
      title: "Sự kiện",
      hours: "Theo đặt lịch, ban ngày",
      items: ["Họp nhóm", "Ra mắt sản phẩm", "Offline"],
      color: "#3A8C6E",
      icon: "🎉",
    },
    {
      title: "Hàng ký gửi",
      hours: "07:00 - 23:00",
      items: ["CD/DVD", "Đồ lưu niệm", "Sách báo / Tạp chí"],
      color: "#D4A843",
      icon: "📦",
    },
  ],

  // ----------------------------------------------------------
  // DANH MỤC THỰC ĐƠN (đồ uống cafe ngày · đồ ăn pub đêm · rượu)
  // sections[]: { title, items: string[] }. color = vạch màu thẻ (hex).
  // ----------------------------------------------------------
  menus: {
    cafeDayDrinks: {
      title: "Đồ uống — Cafe ban ngày",
      color: "#C8854A",
      sections: [
        {
          title: "Cà phê",
          items: ["Espresso", "Americano", "Cappuccino", "Latte", "Cold brew", "Phin / sữa đá"],
        },
        {
          title: "Trà & không cafein",
          items: ["Trà đen / trà sữa", "Trà hoa quả", "Matcha", "Sô-cô-la nóng / đá"],
        },
        {
          title: "Đồ uống khác",
          items: ["Nước ép / sinh tố", "Soda", "Nước suối"],
        },
      ],
    },
    pubNightFood: {
      title: "Đồ ăn — Pub ban đêm",
      color: "#7B5EA7",
      sections: [
        {
          title: "Món nhắm / finger food",
          items: ["Cold-cut / Salad", "Khoai tây chiên", "Xúc xích nướng", "Khô gà / heo / bò", "Lạc rang", "Củ đậu / Dưa chuột"],
        },
        {
          title: "Món nóng",
          items: ["Bánh mì nướng", "Bò / heo nướng xiên", "Cánh gà / sụn"],
        },
      ],
    },
    liquor: {
      title: "Danh mục rượu",
      color: "#5C3D6E",
      sections: [
        {
          title: "Bia",
          items: ["Bia chai / lon", "Craft beer (theo nhà cung cấp)", "Bia Bỉ"],
        },
        {
          title: "Rượu mạnh & cocktail base",
          items: ["Jack Daniels", "Gin Blue Sapphire", "Tequila", "Rượu men lá / rượu mơ (NCC cũ)", "Anh Đào", "Mầm"],
        },
        {
          title: "Rượu vang & cocktail",
          items: ["Vang đỏ / trắng (lon)", "Jack Coke", "Gin Tonic"],
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // DANH MỤC CHƯƠNG TRÌNH NGHỆ THUẬT
  // Cùng cấu trúc với một thẻ trong menus: title, color, sections[].
  // ----------------------------------------------------------
  artPrograms: {
    title: "Danh mục chương trình nghệ thuật",
    color: "#3A8C6E",
    sections: [
      {
        title: "Âm nhạc trực tiếp",
        items: [
          "Acoustic (Sáng)",
          "Ngẫu hứng không giới hạn (Tối)",
        ],
      },
      {
        title: "Hình ảnh & trải nghiệm",
        items: [
          "Chiếu phim ngắn / MV (màn trong quán)",
          "Triển lãm ảnh / tranh nhỏ (xoay theo tháng)",
          "Workshop mini: pha chế, vẽ, vinyl listening",
        ],
      },
      {
        title: "Sân khấu nhỏ & tương tác",
        items: [
          "Stand-up comedy",
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // CHỈ SỐ KINH DOANH
  // ----------------------------------------------------------
  metrics: [
    { label: "Doanh thu / ngày",    value: "2–3M",   unit: "đồng" },
    { label: "Tỉ lệ lãi gộp",       value: "70-80",  unit: "%" },
    { label: "Khách / ngày",         value: "40-50", unit: "lượt" },
    { label: "Hoàn vốn dự kiến",    value: "???",  unit: "tháng" },
  ],

  // ----------------------------------------------------------
  // CƠ CẤU CHI PHÍ HÀNG THÁNG
  // percent = giá trị chi phí (triệu đồng). % & độ dài thanh trên trang = tự tính theo tổng.
  // ----------------------------------------------------------
  costs: [
    { label: "Dịch vụ mặt bằng",   percent: 18.5, color: "#C8854A" },
    { label: "Nhân sự",       percent: 27, color: "#7B5EA7" },
    { label: "Nguyên vật liệu", percent: 10, color: "#3A8C6E" },
    { label: "Marketing",       percent: 0,  color: "#D4A843" },
    { label: "Chi phí khác",    percent: 3,  color: "#888780" },
  ],

  // Tab dưới mục chi phí: nhãn + id khớp panel (overview | detail)
  costTabs: [
    { id: "overview", label: "Tổng quan" },
    { id: "detail", label: "Chi tiết cơ cấu tiền" },
  ],

  // Chi tiết dòng tiền (triệu đồng / tháng). Chỉnh sửa theo thực tế quán.
  costBreakdown: [
    {
      title: "Mặt bằng & cố định",
      items: [
        { label: "Tiền thuê nhà / mặt bằng", million: 14 },
        { label: "Phí quản lý, DV chung", million: 1 },
      ],
    },
    {
      title: "Điện — nước — Internet — Trông giữ xe — vệ sinh",
      items: [
        { label: "Điện sinh hoạt + kinh doanh", million: 3 },
        { label: "Nước", million: 0.5 },
        { label: "Internet", million: 0, note: "Theo gói DV chung" },
        { label: "Trông giữ xe", million: 0, note: "Theo gói DV chung, qua đêm mất tiền" },
        { label: "Thu gom rác / vệ sinh", million: 0, note: "Theo gói DV chung" },
      ],
    },
    {
      title: "Nhân sự",
      items: [
        { label: "Lương nhân viên nước (x3 ca)", million: 12 },
        { label: "Lương nhân viên bếp (x1 ca)", million: 15 },
      ],
    },
    {
      title: "Nguyên vật liệu",
      items: [
        { label: "Cà phê, trà, sữa, hoa quả", million: 5 },
        { label: "Đồ uống khác, topping, bánh", million: 3 },
        { label: "Pub: bia, đồ nhậu (tồn kho)", million: 2 },
      ],
    },
    {
      title: "Marketing & khác",
      items: [
        { label: "Quảng cáo, KOL, voucher", million: 0, note: "Có thể tăng theo chiến dịch" },
        { label: "Bảo trì thiết bị, vật dụng nhỏ", million: 0 },
        { label: "Phí ngân hàng, gói phần mềm, linh tinh", million: 0 },
      ],
    },
  ],

  // ----------------------------------------------------------
  // YẾU TỐ THÀNH CÔNG
  // ----------------------------------------------------------
  successFactors: [
    {
      number: "01",
      title: "Vị trí đắc địa",
      desc: "Gần nhiều văn phòng, ngõ giao thông đông đúc, chỗ để xe tiện lợi",
    },
    {
      number: "02",
      title: "Thương hiệu rõ ràng",
      desc: "Phong cách nhất quán, logo ấn tượng, câu chuyện thương hiệu",
    },
    {
      number: "03",
      title: "Chất lượng ổn định",
      desc: "Đồ uống ngon, phục vụ nhanh, duy trì chuẩn công thức",
    },
    {
      number: "04",
      title: "Trải nghiệm độc đáo",
      desc: "Không gian check-in đẹp, âm nhạc phù hợp, sự kiện định kỳ",
    },
  ],

  // ----------------------------------------------------------
  // LƯU Ý PHÁP LÝ
  // ----------------------------------------------------------
  legalItems: [
    "Giấy phép kinh doanh",
    "Giấy phép bán rượu bia",
    "Chứng nhận ATTP",
    "Phòng cháy chữa cháy (PCCC)",
    "Đăng ký nhãn hiệu",
  ],
  legalNote: "Liên hệ cơ quan địa phương để xác nhận yêu cầu cụ thể tại khu vực của bạn.",

  // ----------------------------------------------------------
  // FOOTER
  // ----------------------------------------------------------
  footer: {
    credit: "Mới",
    year: 2026,
  },
};
