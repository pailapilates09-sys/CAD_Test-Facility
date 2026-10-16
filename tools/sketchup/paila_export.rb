# Paila Pilates read-only SketchUp exporter. Run inside SketchUp Desktop.
# Does not erase, purge, move, save, rename or otherwise change the active model.
require 'json'
require 'digest'
require 'fileutils'
require 'time'
module PailaPreserve
  INCH_TO_M = 0.0254
  def self.id(entity)
    return entity.persistent_id.to_s if entity.respond_to?(:persistent_id)
    return entity.entityID.to_s if entity.respond_to?(:entityID)
    entity.class.name + ':' + Digest::SHA256.hexdigest(entity.respond_to?(:name) ? entity.name.to_s : entity.to_s)[0, 16]
  end
  def self.point(value)
    value.to_a.map { |n| n.to_f * INCH_TO_M }
  end
  def self.matrix(value)
    a = value.to_a.map(&:to_f)
    [12, 13, 14].each { |i| a[i] *= INCH_TO_M }
    a
  end
  def self.attributes(entity)
    out = {}
    dictionaries = entity.respond_to?(:attribute_dictionaries) ? entity.attribute_dictionaries : nil
    if dictionaries
      dictionaries.each do |d|
        values = {}
        d.each_pair { |key, value| values[key] = value.is_a?(String) || value.is_a?(Numeric) || value == true || value == false || value.nil? ? value : value.inspect }
        out[d.name] = values
      end
    end
    out
  end
  def self.run
    model = Sketchup.active_model
    folder = UI.select_directory(title: 'Choose a NEW export folder (model is read only)')
    return unless folder
    target = File.join(folder, 'PILATES_export_' + Time.now.utc.strftime('%Y%m%dT%H%M%SZ'))
    raise 'Export folder already exists' if File.exist?(target)
    FileUtils.mkdir_p(File.join(target, 'textures'))
    materials = model.materials.map do |m|
      texture = nil
      if m.texture
        original = File.basename(m.texture.filename.to_s)
        name = (id(m) + '_' + original).gsub(/[^a-zA-Z0-9._-]/, '_')
        begin
          written = m.texture.write(File.join(target, 'textures', name))
          texture = { source_name: original, file: written ? 'textures/' + name : nil, width_inch: m.texture.width.to_f, height_inch: m.texture.height.to_f, exported: written }
        rescue => error
          texture = { source_name: original, exported: false, error: error.message }
        end
      end
      { id: id(m), name: m.display_name, rgb: [m.color.red, m.color.green, m.color.blue], alpha: m.alpha, texture: texture, attributes: attributes(m) }
    end
    scene = { schema_version: 'paila-scene-1.0', units: 'm', axes: 'SketchUp XYZ, Z up', source: { name: File.basename(model.path.to_s), title: model.title, saved_source_sha256: File.file?(model.path) ? Digest::SHA256.file(model.path).hexdigest : nil, source_file_size: File.file?(model.path) ? File.size(model.path) : nil, saved_file_may_differ_from_unsaved_active_model: true, exported_at: Time.now.utc.iso8601, sketchup_version: Sketchup.version }, materials: materials, definitions: [], root: { id: 'root', name: model.title, faces: [], children: [] }, scenes: [], tags: [], warnings: [] }
    raw = File.open(File.join(target, 'entities.jsonl'), 'w:utf-8')
    visited = {}
    exporter = nil
    exporter = lambda do |entities, container|
      entities.each do |entity|
        record = { id: id(entity), container: container[:id], type: entity.typename, attributes: attributes(entity) }
        record[:hidden] = entity.respond_to?(:hidden?) ? entity.hidden? : false
        record[:tag] = entity.respond_to?(:layer) ? entity.layer.name : nil
        if entity.is_a?(Sketchup::Face)
          mesh = entity.mesh(7)
          positions = mesh.points.map { |p| point(p) }
          triangles = mesh.polygons.map { |poly| poly.map { |i| i.abs - 1 } }
          record.merge!({ positions: positions, polygons: triangles, loops: entity.loops.map { |loop| { outer: loop.outer?, vertices: loop.vertices.map { |v| point(v.position) } } }, front_material: entity.material ? id(entity.material) : nil, back_material: entity.back_material ? id(entity.back_material) : nil, normals: (1..mesh.count_points).map { |i| mesh.normal_at(i).to_a }, uvq_front: (1..mesh.count_points).map { |i| mesh.uv_at(i, true).to_a }, uvq_back: (1..mesh.count_points).map { |i| mesh.uv_at(i, false).to_a } })
          color = entity.material ? entity.material.color : Sketchup::Color.new(180, 195, 190)
          tag_visible = entity.layer.visible?
          container[:faces] << { id: id(entity), positions: positions, polygons: triangles, rgb: [color.red, color.green, color.blue], visible: !entity.hidden? && tag_visible }
        elsif entity.is_a?(Sketchup::ComponentInstance) || entity.is_a?(Sketchup::Group)
          definition = entity.definition
          did = id(definition)
          child = { id: id(entity), name: entity.name.to_s.empty? ? definition.name : entity.name, definition_id: did, matrix_m: matrix(entity.transformation), visible: !entity.hidden? && entity.layer.visible?, material_id: entity.material ? id(entity.material) : nil }
          container[:children] << child
          record.merge!(child)
          unless visited[did]
            visited[did] = true
            local = { id: did, name: definition.name, faces: [], children: [], attributes: attributes(definition) }
            scene[:definitions] << local
            exporter.call(definition.entities, local)
          end
        elsif entity.is_a?(Sketchup::Edge)
          record[:start_m] = point(entity.start.position)
          record[:end_m] = point(entity.end.position)
          record[:soft] = entity.soft?
          record[:smooth] = entity.smooth?
        elsif entity.is_a?(Sketchup::Image)
          record[:bounds_m] = [point(entity.bounds.min), point(entity.bounds.max)]
          scene[:warnings] << 'Image entity retained as metadata only: ' + id(entity)
        else
          record[:text] = entity.text if entity.respond_to?(:text)
          record[:description] = entity.inspect
        end
        raw.puts(JSON.generate(record))
      end
    end
    exporter.call(model.entities, scene[:root])
    # Preserve unused component definitions too, separately from placed instances.
    model.definitions.each do |definition|
      did = id(definition)
      next if visited[did]
      visited[did] = true
      local = { id: did, name: definition.name, faces: [], children: [], attributes: attributes(definition), initially_unused: true }
      scene[:definitions] << local
      exporter.call(definition.entities, local)
    end
    raw.close
    model.layers.each { |layer| scene[:tags] << { id: id(layer), name: layer.name, visible: layer.visible? } }
    model.pages.each { |page| scene[:scenes] << { name: page.name, camera: { eye_m: point(page.camera.eye), target_m: point(page.camera.target), up: page.camera.up.to_a, perspective: page.camera.perspective? } } }
    File.write(File.join(target, 'scene.json'), JSON.generate(scene))
    File.write(File.join(target, 'materials.json'), JSON.pretty_generate(materials))
    File.write(File.join(target, 'definitions.json'), JSON.pretty_generate(scene[:definitions].map { |d| { id: d[:id], name: d[:name], face_count: d[:faces].length, child_count: d[:children].length, initially_unused: d[:initially_unused] || false } }))
    File.open(File.join(target, 'components.csv'), 'w:utf-8') do |f|
      f.puts('container_id,instance_id,definition_id,name')
      ([scene[:root]] + scene[:definitions]).each { |d| d[:children].each { |c| f.puts([d[:id], c[:id], c[:definition_id], c[:name]].map { |v| '"' + v.to_s.gsub('"', '""') + '"' }.join(',')) } }
    end
    report = "Read-only export completed. Units: metres. Source raw SKP remains authoritative.\nDefinitions: #{scene[:definitions].length}. Root children: #{scene[:root][:children].length}.\nThis export is geometry/metadata, not a lossless substitute for SKP; textures may be copied but are not mapped in the web viewer.\nRun ingest-scene.py for SQL/SQLite and duplicate-candidate inspection. No duplicates were removed.\n"
    File.write(File.join(target, 'README.txt'), report)
    manifest = Dir.glob(File.join(target, '**', '*')).select { |p| File.file?(p) }.map { |p| { path: p.sub(target + File::SEPARATOR, ''), bytes: File.size(p), sha256: Digest::SHA256.file(p).hexdigest } }
    File.write(File.join(target, 'manifest.json'), JSON.pretty_generate(manifest))
    UI.messagebox('Read-only export saved: ' + target)
  rescue => error
    raw.close if defined?(raw) && raw && !raw.closed?
    UI.messagebox('Export stopped: ' + error.message + '. Partial files may remain; source model was not modified.')
    raise
  end
end
PailaPreserve.run
