import { Controller, Get, Param, Res } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { FastifyReply } from 'fastify';

const MEDIA_ROOT = path.resolve(__dirname, '..', '..', '..', '..', 'media');

@Controller('media')
export class MediaController {
  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() reply: FastifyReply) {
    const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(MEDIA_ROOT, safe);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return reply.status(404).send({ error: 'Not found' });
    }
    const stream = fs.createReadStream(filePath);
    const ext = path.extname(safe).toLowerCase();
    const mime: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4',
      '.webm': 'video/webm', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
    };
    reply.type(mime[ext] ?? 'application/octet-stream');
    return reply.send(stream);
  }
}
