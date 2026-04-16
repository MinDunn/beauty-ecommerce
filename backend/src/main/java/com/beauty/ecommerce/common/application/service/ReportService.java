package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.order.adapter.out.persistence.OrderJpaEntity;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;

    public byte[] generateOrderReportCsv() {
        return generateOrderReportExcel();
    }

    public byte[] generateOrderReportExcel() {
        List<OrderJpaEntity> orders = orderRepository.findAll();
        orders.sort((o1, o2) -> {
            if (o1.getOrderDate() == null && o2.getOrderDate() == null) return 0;
            if (o1.getOrderDate() == null) return 1;
            if (o2.getOrderDate() == null) return -1;
            return o2.getOrderDate().compareTo(o1.getOrderDate());
        });

        try (Workbook workbook = new XSSFWorkbook()) {
            
            // ================= COMMON STYLES =================
            // Standard Font
            Font normalFont = workbook.createFont();
            normalFont.setFontName("Times New Roman");
            normalFont.setFontHeightInPoints((short) 12);

            Font boldFont = workbook.createFont();
            boldFont.setFontName("Times New Roman");
            boldFont.setBold(true);
            boldFont.setFontHeightInPoints((short) 12);
            
            Font italicFont = workbook.createFont();
            italicFont.setFontName("Times New Roman");
            italicFont.setItalic(true);
            italicFont.setFontHeightInPoints((short) 11);

            // Table Header Style
            CellStyle tableHeaderStyle = workbook.createCellStyle();
            Font tableHeaderFont = workbook.createFont();
            tableHeaderFont.setFontName("Times New Roman");
            tableHeaderFont.setBold(true);
            // standard circulars usually just use bold text and border for headers, no fancy colors
            tableHeaderStyle.setFont(tableHeaderFont);
            tableHeaderStyle.setAlignment(HorizontalAlignment.CENTER);
            tableHeaderStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            tableHeaderStyle.setBorderBottom(BorderStyle.THIN);
            tableHeaderStyle.setBorderTop(BorderStyle.THIN);
            tableHeaderStyle.setBorderLeft(BorderStyle.THIN);
            tableHeaderStyle.setBorderRight(BorderStyle.THIN);
            tableHeaderStyle.setWrapText(true);

            // Title Style
            Font titleFont = workbook.createFont();
            titleFont.setFontName("Times New Roman");
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle dateSubTitleStyle = workbook.createCellStyle();
            dateSubTitleStyle.setFont(italicFont);
            dateSubTitleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Normal Cell Style
            CellStyle cellStyle = workbook.createCellStyle();
            cellStyle.setFont(normalFont);
            cellStyle.setBorderBottom(BorderStyle.THIN);
            cellStyle.setBorderTop(BorderStyle.THIN);
            cellStyle.setBorderLeft(BorderStyle.THIN);
            cellStyle.setBorderRight(BorderStyle.THIN);
            
            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.cloneStyleFrom(cellStyle);
            centerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Currency Style
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.cloneStyleFrom(cellStyle);
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0"));
            
            // Text Styles without borders for generic text
            CellStyle noBorderBoldStyle = workbook.createCellStyle();
            noBorderBoldStyle.setFont(boldFont);
            
            CellStyle noBorderCenterBoldStyle = workbook.createCellStyle();
            noBorderCenterBoldStyle.setFont(boldFont);
            noBorderCenterBoldStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle noBorderCenterItalicStyle = workbook.createCellStyle();
            noBorderCenterItalicStyle.setFont(italicFont);
            noBorderCenterItalicStyle.setAlignment(HorizontalAlignment.CENTER);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
            LocalDate today = LocalDate.now();

            // ================= SHEET 1: REVENUE SUMMARY =================
            Sheet sheet1 = workbook.createSheet("Tom tat doanh thu");

            // Company Info Header
            Row s1Row0 = sheet1.createRow(0);
            Cell c1R0 = s1Row0.createCell(0); 
            c1R0.setCellValue("Đơn vị: CÔNG TY TNHH MỸ PHẨM GLOWZY");
            c1R0.setCellStyle(noBorderBoldStyle);

            Row s1Row1 = sheet1.createRow(1);
            Cell c1R1 = s1Row1.createCell(0); 
            c1R1.setCellValue("Địa chỉ: Trụ sở văn phòng chính");
            c1R1.setCellStyle(noBorderBoldStyle);

            // Report Title
            Row s1TitleRow = sheet1.createRow(3);
            s1TitleRow.setHeightInPoints(25);
            Cell s1TitleCell = s1TitleRow.createCell(0);
            s1TitleCell.setCellValue("BÁO CÁO TÓM TẮT DOANH THU THEO NGÀY");
            s1TitleCell.setCellStyle(titleStyle);
            sheet1.addMergedRegion(new CellRangeAddress(3, 3, 0, 4));

            Row s1DateRow = sheet1.createRow(4);
            Cell s1DateCell = s1DateRow.createCell(0);
            s1DateCell.setCellValue("Ngày lập biểu: " + today.format(dateFormatter));
            s1DateCell.setCellStyle(dateSubTitleStyle);
            sheet1.addMergedRegion(new CellRangeAddress(4, 4, 0, 4));

            // Data Header
            Row s1HeaderRow = sheet1.createRow(6);
            String[] s1Columns = {"STT", "Ngày", "Tổng số đơn", "Đơn thành công", "Doanh thu (VNĐ)"};
            for (int i = 0; i < s1Columns.length; i++) {
                Cell cell = s1HeaderRow.createCell(i);
                cell.setCellValue(s1Columns[i]);
                cell.setCellStyle(tableHeaderStyle);
            }

            Map<LocalDate, List<OrderJpaEntity>> ordersByDate = orders.stream()
                    .filter(o -> o.getOrderDate() != null)
                    .collect(Collectors.groupingBy(o -> o.getOrderDate().toLocalDate()));
            
            List<LocalDate> sortedDates = ordersByDate.keySet().stream()
                    .sorted(Collections.reverseOrder())
                    .collect(Collectors.toList());

            int s1RowNum = 7;
            int s1Stt = 1;
            BigDecimal totalSystemRevenue = BigDecimal.ZERO;

            for (LocalDate date : sortedDates) {
                List<OrderJpaEntity> dayOrders = ordersByDate.get(date);
                long totalOrdersCount = dayOrders.size();
                long completedOrdersCount = dayOrders.stream()
                        .filter(o -> OrderStatus.DELIVERED.name().equalsIgnoreCase(o.getStatus()))
                        .count();
                
                BigDecimal dayRevenue = dayOrders.stream()
                        .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                        .map(OrderJpaEntity::getTotalPrice)
                        .filter(java.util.Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                totalSystemRevenue = totalSystemRevenue.add(dayRevenue);

                Row row = sheet1.createRow(s1RowNum++);
                Cell c0 = row.createCell(0); c0.setCellValue(s1Stt++); c0.setCellStyle(centerStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(date.format(dateFormatter)); c1.setCellStyle(centerStyle);
                Cell c2 = row.createCell(2); c2.setCellValue(totalOrdersCount); c2.setCellStyle(centerStyle);
                Cell c3 = row.createCell(3); c3.setCellValue(completedOrdersCount); c3.setCellStyle(centerStyle);
                Cell c4 = row.createCell(4); c4.setCellValue(dayRevenue.doubleValue()); c4.setCellStyle(currencyStyle);
            }

            // Summary Footer
            Row s1TotalRow = sheet1.createRow(s1RowNum++);
            Cell s1fC0 = s1TotalRow.createCell(0); s1fC0.setCellValue(""); s1fC0.setCellStyle(tableHeaderStyle);
            Cell s1fC1 = s1TotalRow.createCell(1); s1fC1.setCellValue("TỔNG CỘNG"); s1fC1.setCellStyle(tableHeaderStyle);
            Cell s1fC2 = s1TotalRow.createCell(2); s1fC2.setCellValue(""); s1fC2.setCellStyle(tableHeaderStyle);
            Cell s1fC3 = s1TotalRow.createCell(3); s1fC3.setCellValue(""); s1fC3.setCellStyle(tableHeaderStyle);
            Cell s1fC4 = s1TotalRow.createCell(4); s1fC4.setCellValue(totalSystemRevenue.doubleValue()); 
            
            CellStyle totalCurrencyStyle = workbook.createCellStyle();
            totalCurrencyStyle.cloneStyleFrom(tableHeaderStyle);
            totalCurrencyStyle.setDataFormat(format.getFormat("#,##0"));
            s1fC4.setCellStyle(totalCurrencyStyle);

            for (int i = 0; i < s1Columns.length; i++) {
                sheet1.autoSizeColumn(i);
                sheet1.setColumnWidth(i, sheet1.getColumnWidth(i) + 1024);
            }

            // Signatures Section Sheet 1
            createSignatures(sheet1, s1RowNum + 2, 4);


            // ================= SHEET 2: DETAILED ORDERS =================
            Sheet sheet2 = workbook.createSheet("Danh sach don hang");

            Row s2Row0 = sheet2.createRow(0);
            Cell s2cR0 = s2Row0.createCell(0); s2cR0.setCellValue("Đơn vị: CÔNG TY TNHH MỸ PHẨM GLOWZY"); s2cR0.setCellStyle(noBorderBoldStyle);

            Row s2Row1 = sheet2.createRow(1);
            Cell s2cR1 = s2Row1.createCell(0); s2cR1.setCellValue("Địa chỉ: Trụ sở văn phòng chính"); s2cR1.setCellStyle(noBorderBoldStyle);

            Row s2TitleRow = sheet2.createRow(3);
            s2TitleRow.setHeightInPoints(25);
            Cell s2TitleCell = s2TitleRow.createCell(0);
            s2TitleCell.setCellValue("SỔ CHI TIẾT ĐƠN HÀNG PHÁT SINH");
            s2TitleCell.setCellStyle(titleStyle);
            sheet2.addMergedRegion(new CellRangeAddress(3, 3, 0, 8));

            Row s2DateRow = sheet2.createRow(4);
            Cell s2DateCell = s2DateRow.createCell(0);
            s2DateCell.setCellValue("Ngày lập biểu: " + today.format(dateFormatter));
            s2DateCell.setCellStyle(dateSubTitleStyle);
            sheet2.addMergedRegion(new CellRangeAddress(4, 4, 0, 8));

            Row s2HeaderRow = sheet2.createRow(6);
            String[] s2Columns = {"STT", "Mã đơn hàng", "Thời gian đặt", "Tên người nhận", "Số điện thoại", "Địa chỉ giao hàng", "Tổng tiền", "Trạng thái", "Phương thức"};
            for (int i = 0; i < s2Columns.length; i++) {
                Cell cell = s2HeaderRow.createCell(i);
                cell.setCellValue(s2Columns[i]);
                cell.setCellStyle(tableHeaderStyle);
            }

            int s2RowNum = 7;
            int s2Stt = 1;
            for (OrderJpaEntity order : orders) {
                Row row = sheet2.createRow(s2RowNum++);
                
                Cell c0 = row.createCell(0); c0.setCellValue(s2Stt++); c0.setCellStyle(centerStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(order.getId() != null ? String.valueOf(order.getId()) : ""); c1.setCellStyle(centerStyle);
                Cell c2 = row.createCell(2); c2.setCellValue(order.getOrderDate() != null ? order.getOrderDate().format(dateTimeFormatter) : ""); c2.setCellStyle(centerStyle);
                Cell c3 = row.createCell(3); c3.setCellValue(order.getReceiverName() != null ? order.getReceiverName() : ""); c3.setCellStyle(cellStyle);
                Cell c4 = row.createCell(4); c4.setCellValue(order.getReceiverPhone() != null ? order.getReceiverPhone() : ""); c4.setCellStyle(centerStyle);
                Cell c5 = row.createCell(5); c5.setCellValue(order.getShippingAddress() != null ? order.getShippingAddress() : ""); c5.setCellStyle(cellStyle);
                
                Cell c6 = row.createCell(6); 
                if (order.getTotalPrice() != null) {
                    c6.setCellValue(order.getTotalPrice().doubleValue());
                } else {
                    c6.setCellValue(0);
                }
                c6.setCellStyle(currencyStyle);
                
                Cell c7 = row.createCell(7); c7.setCellValue(order.getStatus() != null ? order.getStatus() : ""); c7.setCellStyle(centerStyle);
                Cell c8 = row.createCell(8); c8.setCellValue(order.getPaymentMethod() != null ? order.getPaymentMethod() : ""); c8.setCellStyle(centerStyle);
            }

            for (int i = 0; i < s2Columns.length; i++) {
                sheet2.autoSizeColumn(i);
                sheet2.setColumnWidth(i, sheet2.getColumnWidth(i) + 512); 
            }

            createSignatures(sheet2, s2RowNum + 2, 8);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel báo cáo: " + e.getMessage());
        }
    }

    private void createSignatures(Sheet sheet, int startRow, int maxColIndex) {
        Workbook workbook = sheet.getWorkbook();
        
        Font boldFont = workbook.createFont();
        boldFont.setFontName("Times New Roman");
        boldFont.setBold(true);
        boldFont.setFontHeightInPoints((short) 12);
        
        Font italicFont = workbook.createFont();
        italicFont.setFontName("Times New Roman");
        italicFont.setItalic(true);
        italicFont.setFontHeightInPoints((short) 12);
        
        CellStyle centerBoldStyle = workbook.createCellStyle();
        centerBoldStyle.setFont(boldFont);
        centerBoldStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle centerItalicStyle = workbook.createCellStyle();
        centerItalicStyle.setFont(italicFont);
        centerItalicStyle.setAlignment(HorizontalAlignment.CENTER);
        
        LocalDate date = LocalDate.now();
        String dateString = String.format("Ngày %02d tháng %02d năm %d", date.getDayOfMonth(), date.getMonthValue(), date.getYear());

        // Date row
        Row r1 = sheet.createRow(startRow);
        Cell dCell = r1.createCell(maxColIndex);
        dCell.setCellValue(dateString);
        dCell.setCellStyle(centerItalicStyle);

        // Signer Titles
        Row r2 = sheet.createRow(startRow + 1);
        Cell c1 = r2.createCell(0); c1.setCellValue("Người lập biểu"); c1.setCellStyle(centerBoldStyle);
        Cell c2 = r2.createCell(maxColIndex / 2); c2.setCellValue("Kế toán trưởng"); c2.setCellStyle(centerBoldStyle);
        Cell c3 = r2.createCell(maxColIndex); c3.setCellValue("Giám đốc"); c3.setCellStyle(centerBoldStyle);

        // Signer Subtitles
        Row r3 = sheet.createRow(startRow + 2);
        Cell sc1 = r3.createCell(0); sc1.setCellValue("(Ký, họ tên)"); sc1.setCellStyle(centerItalicStyle);
        Cell sc2 = r3.createCell(maxColIndex / 2); sc2.setCellValue("(Ký, họ tên)"); sc2.setCellStyle(centerItalicStyle);
        Cell sc3 = r3.createCell(maxColIndex); sc3.setCellValue("(Ký, đóng dấu, họ tên)"); sc3.setCellStyle(centerItalicStyle);
    }
}
