use tauri::Manager;

/// Save a base64-encoded image to $APPDATA/images/<filename>.
/// Called from JS via window.__TAURI__.core.invoke('save_image', { filename, dataBase64 })
#[tauri::command]
fn save_image(app: tauri::AppHandle, filename: String, data_base64: String) -> Result<(), String> {
    use base64::Engine;
    let data = base64::engine::general_purpose::STANDARD
        .decode(&data_base64)
        .map_err(|e| format!("base64 decode error: {e}"))?;

    let images_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir error: {e}"))?
        .join("images");

    std::fs::create_dir_all(&images_dir)
        .map_err(|e| format!("mkdir error: {e}"))?;

    std::fs::write(images_dir.join(&filename), data)
        .map_err(|e| format!("write error: {e}"))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_image])
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
