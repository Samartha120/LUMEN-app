import { Injectable, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import { Complaint, User } from '@prisma/client';
import * as path from 'path';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private db: Database.Database;

  constructor() {
    try {
      const dbPath = 'D:/Lumen-Web/LUMEN-website/database/lumen.db';
      this.db = new Database(dbPath, { fileMustExist: false });
      this.logger.log(`Connected to Web Dashboard SQLite database at ${dbPath}`);
    } catch (error) {
      this.logger.error('Failed to connect to Web Dashboard SQLite database', error);
    }
  }

  syncComplaintToWebDashboard(complaint: Complaint) {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO Complaint (
          id, trackingId, title, description, category, severity, confidence, priority, status,
          latitude, longitude, imageUrl, videoUrl, reporterId, createdAt, updatedAt
        ) VALUES (
          @id, @trackingId, @title, @description, @category, @severity, @confidence, @priority, @status,
          @latitude, @longitude, @imageUrl, @videoUrl, @reporterId, @createdAt, @updatedAt
        )
      `);

      stmt.run({
        id: complaint.id,
        trackingId: complaint.trackingId,
        title: complaint.title,
        description: complaint.description || null,
        category: complaint.category,
        severity: complaint.severity != null ? Math.round(complaint.severity) : null,
        confidence: complaint.confidence != null ? complaint.confidence : null,
        priority: complaint.priority.toString(),
        status: complaint.status.toString(),
        latitude: complaint.latitude || null,
        longitude: complaint.longitude || null,
        imageUrl: complaint.imageUrl || null,
        videoUrl: complaint.videoUrl || null,
        reporterId: complaint.reporterId || null,
        createdAt: complaint.createdAt.toISOString(),
        updatedAt: complaint.updatedAt.toISOString(),
      });
      this.logger.log(`Successfully synced complaint ${complaint.trackingId} to Web Dashboard database`);
    } catch (error) {
      this.logger.error(`Failed to sync complaint ${complaint.trackingId} to Web Dashboard`, error);
    }
  }
}
