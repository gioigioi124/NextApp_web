import { PrismaClient, PostType, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user exists
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('No admin user found. Please create an admin user first.');
    return;
  }

  // Create Về chúng tôi
  const aboutUs = await prisma.post.upsert({
    where: { slug: 've-chung-toi' },
    update: {},
    create: {
      title: 'Về chúng tôi',
      slug: 've-chung-toi',
      content: `
        <h2>Chào mừng đến với Lumina Bedding</h2>
        <p>Lumina Bedding ra đời với sứ mệnh mang đến giấc ngủ trọn vẹn cho hàng triệu gia đình Việt. Chúng tôi tin rằng không gian nghỉ ngơi chính là chìa khóa cho một tinh thần sảng khoái và một cơ thể khỏe mạnh mỗi ngày.</p>
        <p>Với các sản phẩm từ chất liệu thân thiện với môi trường, thiết kế tinh giản và độ bền cao, Lumina cam kết mang lại sự êm ái vượt thời gian.</p>
        <h3>Giá trị cốt lõi</h3>
        <ul>
          <li><strong>Chất lượng:</strong> Lựa chọn chất liệu tốt nhất, quy trình sản xuất nghiêm ngặt.</li>
          <li><strong>Tận tâm:</strong> Luôn lắng nghe và chăm sóc khách hàng bằng cả trái tim.</li>
          <li><strong>Bền vững:</strong> Hướng tới lối sống xanh và các sản phẩm thân thiện với môi trường.</li>
        </ul>
      `,
      excerpt: 'Lumina Bedding ra đời với sứ mệnh mang đến giấc ngủ trọn vẹn cho hàng triệu gia đình Việt.',
      status: PostStatus.PUBLISHED,
      type: PostType.PAGE,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // Create Điều khoản dịch vụ
  const terms = await prisma.post.upsert({
    where: { slug: 'dieu-khoan-dich-vu' },
    update: {},
    create: {
      title: 'Điều khoản dịch vụ',
      slug: 'dieu-khoan-dich-vu',
      content: `
        <h2>1. Giới thiệu chung</h2>
        <p>Chào mừng bạn đến với website của Lumina Bedding. Khi sử dụng website này, bạn đồng ý với các điều khoản và điều kiện được mô tả dưới đây.</p>
        <h2>2. Quyền lợi và Nghĩa vụ của Người dùng</h2>
        <p>Người dùng có trách nhiệm bảo mật thông tin cá nhân khi đăng ký tài khoản. Mọi hành vi chia sẻ mật khẩu hay cung cấp thông tin sai lệch dẫn đến rủi ro đều nằm ngoài trách nhiệm của chúng tôi.</p>
        <h2>3. Chính sách Đặt hàng & Thanh toán</h2>
        <p>Đơn hàng chỉ được xác nhận khi hệ thống ghi nhận thanh toán thành công (nếu áp dụng). Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp phát hiện gian lận.</p>
        <h2>4. Quyền Sở hữu trí tuệ</h2>
        <p>Toàn bộ nội dung, hình ảnh và thiết kế trên website đều thuộc quyền sở hữu của Lumina Bedding. Mọi hành vi sao chép không được phép sẽ bị xử lý theo pháp luật.</p>
      `,
      excerpt: 'Các quy định và điều kiện chung khi sử dụng nền tảng của Lumina Bedding.',
      status: PostStatus.PUBLISHED,
      type: PostType.PAGE,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // Create Chính sách bảo mật
  const privacy = await prisma.post.upsert({
    where: { slug: 'chinh-sach-bao-mat' },
    update: {},
    create: {
      title: 'Chính sách bảo mật',
      slug: 'chinh-sach-bao-mat',
      content: `
        <h2>1. Thu thập thông tin cá nhân</h2>
        <p>Lumina Bedding thu thập các thông tin như Tên, Số điện thoại, Email, Địa chỉ giao hàng khi bạn đăng ký hoặc đặt mua sản phẩm. Chúng tôi cam kết chỉ sử dụng thông tin này cho việc giao hàng và chăm sóc khách hàng.</p>
        <h2>2. Bảo vệ dữ liệu</h2>
        <p>Dữ liệu của bạn được lưu trữ an toàn và mã hóa trên hệ thống của chúng tôi. Chúng tôi không bao giờ bán, trao đổi thông tin khách hàng cho bên thứ ba vì mục đích thương mại.</p>
        <h2>3. Cookie</h2>
        <p>Website sử dụng Cookie để ghi nhớ phiên đăng nhập và giỏ hàng của bạn, mang lại trải nghiệm mua sắm mượt mà hơn.</p>
      `,
      excerpt: 'Cam kết bảo mật thông tin cá nhân và dữ liệu của khách hàng.',
      status: PostStatus.PUBLISHED,
      type: PostType.PAGE,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // Create Chính sách đổi trả
  const refund = await prisma.post.upsert({
    where: { slug: 'chinh-sach-doi-tra' },
    update: {},
    create: {
      title: 'Chính sách đổi trả',
      slug: 'chinh-sach-doi-tra',
      content: `
        <h2>1. Điều kiện đổi trả</h2>
        <p>Sản phẩm chỉ được đổi trả trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên bao bì, chưa qua sử dụng hay giặt tẩy.</p>
        <h2>2. Các trường hợp được đổi trả</h2>
        <ul>
          <li>Sản phẩm bị lỗi từ nhà sản xuất.</li>
          <li>Giao nhầm size, sai mẫu mã so với đơn đặt hàng.</li>
        </ul>
        <h2>3. Quy trình thực hiện</h2>
        <p>Khách hàng vui lòng liên hệ với hotline hoặc gửi email về bộ phận CSKH để được hướng dẫn gửi trả sản phẩm. Lumina sẽ chịu toàn bộ chi phí vận chuyển trong trường hợp lỗi thuộc về chúng tôi.</p>
      `,
      excerpt: 'Quy định chi tiết về việc đổi và trả hàng tại hệ thống Lumina.',
      status: PostStatus.PUBLISHED,
      type: PostType.PAGE,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // Create Câu hỏi thường gặp
  const faq = await prisma.post.upsert({
    where: { slug: 'cau-hoi-thuong-gap' },
    update: {},
    create: {
      title: 'Câu hỏi thường gặp',
      slug: 'cau-hoi-thuong-gap',
      content: `
        <h2>Hỏi: Sản phẩm có hỗ trợ bảo hành không?</h2>
        <p>Đáp: Tất cả các sản phẩm chăn ga gối đệm của Lumina đều được bảo hành đường may và chất lượng vải trong 12 tháng.</p>
        <h2>Hỏi: Thời gian giao hàng mất bao lâu?</h2>
        <p>Đáp: Tại TP.HCM và Hà Nội, thời gian giao hàng từ 1-2 ngày. Các khu vực khác từ 3-5 ngày làm việc.</p>
        <h2>Hỏi: Làm sao để bảo quản chăn ga đúng cách?</h2>
        <p>Đáp: Nên giặt bằng nước lạnh với chế độ giặt nhẹ, phơi ở nơi thoáng mát và tránh ánh nắng gay gắt chiếu trực tiếp để giữ màu bền lâu.</p>
      `,
      excerpt: 'Tổng hợp giải đáp thắc mắc phổ biến của khách hàng.',
      status: PostStatus.PUBLISHED,
      type: PostType.PAGE,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  console.log('Successfully created static pages:', [aboutUs.title, terms.title, privacy.title, refund.title, faq.title].join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
