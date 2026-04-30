/**
 * Google Drive utilities.
 * Creates the standard folder structure for a new client in the Google Shared Drive.
 *
 * Structure created:
 * 📁 [Nome do Cliente]
 *   📁 Documentos
 *     📁 Contratos
 *     📁 Propostas
 *     📁 Boletos
 *     📁 Notas Fiscais
 *   📁 Projetos
 *   📁 Redes Sociais
 *   📁 Identidade Visual
 */
import { google } from 'googleapis'
import { getServiceAccountAuth } from './auth'

const MIME_FOLDER = 'application/vnd.google-apps.folder'

/** Creates a folder in Google Drive and returns its ID. */
async function createFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string,
  driveId: string
): Promise<string> {
  const res = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name,
      mimeType: MIME_FOLDER,
      parents: [parentId],
    },
    fields: 'id',
  })

  return res.data.id!
}

/**
 * Creates the full Duas Mãos folder structure for a new client inside the
 * Google Shared Drive configured via GOOGLE_DRIVE_ROOT_FOLDER_ID.
 *
 * @returns The Google Drive folder ID of the root client folder.
 */
export async function createClientFolderStructure(clientName: string): Promise<string> {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  const driveId = process.env.GOOGLE_SHARED_DRIVE_ID

  if (!rootFolderId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado no .env.local')
  }

  const auth = getServiceAccountAuth()
  const drive = google.drive({ version: 'v3', auth })

  // 1. Create client root folder
  const clientFolderId = await createFolder(drive, clientName, rootFolderId, driveId || rootFolderId)

  // 2. Create Documentos folder and its subfolders
  const documentosFolderId = await createFolder(drive, 'Documentos', clientFolderId, driveId || rootFolderId)
  await Promise.all([
    createFolder(drive, 'Contratos', documentosFolderId, driveId || rootFolderId),
    createFolder(drive, 'Propostas', documentosFolderId, driveId || rootFolderId),
    createFolder(drive, 'Boletos', documentosFolderId, driveId || rootFolderId),
    createFolder(drive, 'Notas Fiscais', documentosFolderId, driveId || rootFolderId),
  ])

  // 3. Create top-level client folders in parallel
  await Promise.all([
    createFolder(drive, 'Projetos', clientFolderId, driveId || rootFolderId),
    createFolder(drive, 'Redes Sociais', clientFolderId, driveId || rootFolderId),
    createFolder(drive, 'Identidade Visual', clientFolderId, driveId || rootFolderId),
  ])

  return clientFolderId
}

/**
 * Creates a project folder inside the client's "Projetos" folder.
 * The Redes Sociais type gets additional monthly + post structure.
 */
export async function createProjectFolder(
  clientFolderId: string,
  projectName: string,
  projectType: 'redes_sociais' | 'branding' | 'site' | string
): Promise<string> {
  const driveId = process.env.GOOGLE_SHARED_DRIVE_ID
  const auth = getServiceAccountAuth()
  const drive = google.drive({ version: 'v3', auth })

  // Find the Projetos folder inside the client folder
  const listRes = await drive.files.list({
    q: `name = 'Projetos' and '${clientFolderId}' in parents and mimeType = '${MIME_FOLDER}' and trashed = false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id)',
  })

  const projetosFolderId = listRes.data.files?.[0]?.id

  // If Projetos folder not found, use client root
  const parentId = projetosFolderId || clientFolderId

  const projectFolderId = await createFolder(drive, projectName, parentId, driveId || parentId)

  // For social media projects, add a month folder structure
  if (projectType === 'redes_sociais') {
    const now = new Date()
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const monthFolderId = await createFolder(drive, monthName, projectFolderId, driveId || projectFolderId)
    await Promise.all([
      createFolder(drive, 'Feed', monthFolderId, driveId || monthFolderId),
      createFolder(drive, 'Stories', monthFolderId, driveId || monthFolderId),
      createFolder(drive, 'Reels', monthFolderId, driveId || monthFolderId),
    ])
  }

  return projectFolderId
}
