import JSZip from 'jszip';

export interface BundleFile {
  name: string;
  content: string;
  description?: string;
}

export interface BundleOptions {
  bundleName: string;
  files: BundleFile[];
  readme: string;
  includeMetadata?: boolean;
}

export class BundleExporter {
  static async createBundle(options: BundleOptions): Promise<void> {
    console.log("🔄 Creating bundle:", options.bundleName);
    console.log("📁 Files to include:", options.files.length);
    
    const zip = new JSZip();
    
    // Add README.md first
    console.log("📝 Adding README.md...");
    zip.file('README.md', options.readme);
    
    // Add all files
    console.log("📦 Adding files to zip...");
    for (const file of options.files) {
      console.log(`  ➕ Adding: ${file.name} (${file.content.length} chars)`);
      zip.file(file.name, file.content);
    }
    
    // Add metadata if requested
    if (options.includeMetadata) {
      console.log("📋 Adding metadata...");
      const metadata = {
        generatedAt: new Date().toISOString(),
        bundleName: options.bundleName,
        fileCount: options.files.length,
        generator: 'Team1 Portal Export System',
        version: '1.0.0'
      };
      zip.file('_metadata.json', JSON.stringify(metadata, null, 2));
    }
    
    // Generate and download zip
    console.log("🔄 Generating zip blob...");
    const content = await zip.generateAsync({ type: 'blob' });
    console.log("✅ Zip generated, size:", content.size, "bytes");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${options.bundleName}_${timestamp}.zip`;
    console.log("📥 Starting download:", filename);
    
    // Try multiple download methods for better compatibility
    try {
      // Method 1: Standard download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        console.log("✅ Download cleanup completed");
      }, 1000);
      
      console.log("✅ Download initiated successfully");
    } catch (error) {
      console.error("❌ Standard download failed, trying fallback:", error);
      
      // Fallback method: Force download using window.open
      try {
        const url = URL.createObjectURL(content);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.document.title = filename;
        }
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        console.log("✅ Fallback download method used");
      } catch (fallbackError) {
        console.error("❌ All download methods failed:", fallbackError);
        throw new Error(`Download failed: ${fallbackError}`);
      }
    }
  }
  
  static sanitizeContent(content: string): string {
    // Remove sensitive information
    return content
      .replace(/password[s]?\s*[:=]\s*[^\s\n]+/gi, 'password: [REDACTED]')
      .replace(/api[_-]?key[s]?\s*[:=]\s*[^\s\n]+/gi, 'api_key: [REDACTED]')
      .replace(/secret[s]?\s*[:=]\s*[^\s\n]+/gi, 'secret: [REDACTED]')
      .replace(/token[s]?\s*[:=]\s*[^\s\n]+/gi, 'token: [REDACTED]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_REDACTED]');
  }
  
  static generateTableOfContents(files: BundleFile[]): string {
    let toc = '## Files in this Bundle\n\n';
    files.forEach(file => {
      toc += `### ${file.name}\n`;
      if (file.description) {
        toc += `${file.description}\n\n`;
      } else {
        toc += 'Generated data file.\n\n';
      }
    });
    return toc;
  }
}