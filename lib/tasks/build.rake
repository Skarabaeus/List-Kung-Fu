#
# Mostly taken from the jQuery project.
# See http://github.com/jquery/jquery/blob/master/Rakefile
# Thanks! :-)

prefix = File.dirname( '/Users/stefan/projects/ListKungFu' )

# Directory variables
src_dir = File.join( prefix, 'ListKungFu/public/javascripts' )
build_dir = File.join( prefix, 'ListKungFu/lib/build' )
dist_dir = File.join( prefix, 'ListKungFu/public/javascripts' )

base_files = %w{application Controller jquery-rails jquery.ConfirmationDialog jquery.Dashboard jquery.hotkeys jquery.ListItemView jquery.ListView jquery.SerializeForm jquery.StatusBar json2 mustache jquery.layout-1.2.0 jquery.TagView jquery.UltimateSearch jquery.ListItemShow jquery.ListItemEdit}.map { |js| File.join( src_dir, "#{js}.js" ) }

jq = File.join( dist_dir, "listkungfu.all.js" )
jq_min = File.join( dist_dir, "listkungfu.all.min.js" )

# Build tools
rhino = "java -jar #{build_dir}/js.jar"
minfier = "java -jar #{build_dir}/google-compiler-20110126.jar"

# Turn off output other than needed from `sh` and file commands
verbose(false)

desc "Cleans up concatenated and minified file"
task :clean do
  puts "Removing listkungfu.all.js and listkungfu.all.min.js"

  rm_f "#{dist_dir}/listkungfu.all.js"
  rm_f "#{dist_dir}/listkungfu.all.min.js"
end

desc "Builds a minified version of List Kung Fu javascript"
task :build => [:clean, jq_min]

desc "Tests built List Kung Fu javascripts against JSLint"
task :lint => jq do
  puts "Checking List Kung Fu javascripts against JSLint..."
  sh "#{rhino} " + File.join(build_dir, 'jslint-check.js')
end

directory dist_dir

file jq => [dist_dir, base_files].flatten do
  puts "Building listkungfu.all.js ..."

  File.open(jq, 'w') do |f|
    f.write cat(base_files)
  end
end

file jq_min => jq do
  puts "Building listkungfu.all.min.js ..."

  sh "#{minfier} --js #{jq} --warning_level QUIET --js_output_file #{jq_min}"

  min = File.read( jq_min )

  File.open(jq_min, 'w') do |f|
    f.write min
  end

end

def cat( files )
  files.map do |file|
    File.read(file)
  end.join('')
end
