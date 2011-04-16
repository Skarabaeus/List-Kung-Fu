class ListsController < ApplicationController

	before_filter :authenticate_user!
  before_filter :set_cache_buster

  respond_to :json

  def index
    @lists = current_user.lists.order( "created_at desc" )
    respond_with( DefaultDto.new( :template => 'lists-list', :data => @lists.to_json( :methods => [ :tag_helper_color ],
      :include => { :tags => {
         :only => [ :id, :name ],
         :methods => [ :color_rgb, :foreground_color_rgb ] }
        }) ) )
  end

  def new
    @list = List.new

    respond_with( DefaultDto.new( :template => 'lists-form',
      :data => @list.to_json( :methods => [ :tag_helper_color ] ) ) )
  end

  def edit
    @list = current_user.lists.find( params[:id] )


    respond_with( DefaultDto.new( :template => 'lists-form',
      :data => @list.to_json( :methods => [ :tag_helper_color ] ) ) )
  end

  def create
    @list = List.new( params[:list] )
    @list.owner = current_user

    if @list.save
      flash[:notice] = 'List has been created.'
    end

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'lists-list',
        :data => @list.to_json( :methods => [ :tag_helper_color ] ),
        :errors => @list.errors ), :status => :created }
    end

  end

  def update
    flash_notice = 'List title has been updated.'

    @list = current_user.lists.find( params[:id] )

    @list.title = params[ :list ][ :title ]

    tag_id = params[ :list ][ :tag_id ]
    tag_action = params[ :list ][ :tag_action ] || 'add'

    unless tag_id.nil?
      if tag_action == 'remove'
        tag_ids = @list.tag_ids
        tag_ids.delete( tag_id.to_i )
        @list.tag_ids = tag_ids
        flash_notice = 'Tag has been removed from list.'
      else
        # no worries about dublicates, rails takes care of that.
        @list.tag_ids = @list.tag_ids + [ tag_id ]
        flash_notice = 'Tag has been added to list.'
      end
    end

    if @list.save
      flash[:notice] = flash_notice
    end

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'lists-list',
        :data => @list.to_json( :methods => [ :tag_helper_color ],
          :include => { :tags => {
             :only => [ :id, :name ],
             :methods => [ :color_rgb, :foreground_color_rgb ] }
            }),
        :errors => @list.errors ) }
    end
  end

  def destroy
    @list = current_user.lists.find( params[:id] )
    @list.destroy

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => '', :data => {} ) }
    end
  end
end
