import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary';

export const uploadDesign = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file uploaded' });
      return;
    }

    const { mimetype, buffer } = req.file;

    // Validate mimetype again just in case
    if (!mimetype.startsWith('image/') && mimetype !== 'application/pdf') {
       res.status(400).json({ status: 'error', message: 'Only images and PDFs are allowed' });
       return;
    }

    const b64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'custom-designs',
      resource_type: 'auto',
    });

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        format: result.format,
        public_id: result.public_id
      }
    });
  } catch (err: any) {
    console.error('Upload Error: ', err);
    res.status(500).json({ status: 'error', message: err.message || 'Upload to Cloudinary failed' });
  }
};

export const deleteDesign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      res.status(400).json({ status: 'error', message: 'Public ID required' });
      return;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err: any) {
    console.error('Delete Error: ', err);
    res.status(500).json({ status: 'error', message: err.message || 'Delete from Cloudinary failed' });
  }
};
