package com.smartqueue.servlets;

import com.smartqueue.db.Database;
import com.smartqueue.model.TokenStatus;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet(name = "BookAppointmentServlet", urlPatterns = {"/api/book"})
public class BookAppointmentServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String name = request.getParameter("name");
        String phone = request.getParameter("phone");

        PrintWriter out = response.getWriter();

        if (name == null || name.isBlank() || phone == null || phone.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Name and phone are required\"}");
            return;
        }

        try (Connection conn = Database.getConnection()) {
            String insertSql = "INSERT INTO appointments (name, phone, status) VALUES (?, ?, ?) RETURNING id";
            int tokenId = -1;

            try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                ps.setString(1, name);
                ps.setString(2, phone);
                ps.setString(3, TokenStatus.WAITING.name());
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        tokenId = rs.getInt("id");
                    }
                }
            }

            if (tokenId == -1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to generate token\"}");
                return;
            }

            String positionSql =
                    "SELECT COUNT(*) FROM appointments WHERE status = ? AND id <= ?";
            int position = 0;
            try (PreparedStatement psPos = conn.prepareStatement(positionSql)) {
                psPos.setString(1, TokenStatus.WAITING.name());
                psPos.setInt(2, tokenId);
                try (ResultSet rsPos = psPos.executeQuery()) {
                    if (rsPos.next()) {
                        position = rsPos.getInt(1);
                    }
                }
            }

            out.write("{\"success\":true," +
                    "\"token\":" + tokenId + "," +
                    "\"position\":" + position + "," +
                    "\"message\":\"Appointment booked successfully\"}");

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error\"}");
        }
    }
}

